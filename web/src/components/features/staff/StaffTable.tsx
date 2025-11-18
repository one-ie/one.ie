import { useState, useMemo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface StaffMember {
	id: string;
	name: string;
	role: string;
	department: string;
	certifications: string[];
	yearsExperience: number;
	status: "active" | "on-leave" | "offsite";
}

interface StaffTableProps {
	staff: StaffMember[];
}

type SortField = keyof StaffMember | null;
type SortDirection = "asc" | "desc" | null;

export function StaffTable({ staff }: StaffTableProps) {
	const [sortField, setSortField] = useState<SortField>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>(null);

	const sortedStaff = useMemo(() => {
		if (!sortField || !sortDirection) return staff;

		return [...staff].sort((a, b) => {
			const aValue = a[sortField];
			const bValue = b[sortField];

			// Handle array fields (certifications)
			if (Array.isArray(aValue) && Array.isArray(bValue)) {
				const aLength = aValue.length;
				const bLength = bValue.length;
				return sortDirection === "asc"
					? aLength - bLength
					: bLength - aLength;
			}

			// Handle string fields
			if (typeof aValue === "string" && typeof bValue === "string") {
				return sortDirection === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}

			// Handle number fields
			if (typeof aValue === "number" && typeof bValue === "number") {
				return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
			}

			return 0;
		});
	}, [staff, sortField, sortDirection]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			// Cycle through: asc -> desc -> null
			if (sortDirection === "asc") {
				setSortDirection("desc");
			} else if (sortDirection === "desc") {
				setSortField(null);
				setSortDirection(null);
			}
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const SortIcon = ({ field }: { field: SortField }) => {
		if (sortField !== field) {
			return <ArrowUpDown className="ml-2 h-4 w-4" />;
		}
		if (sortDirection === "asc") {
			return <ArrowUp className="ml-2 h-4 w-4" />;
		}
		return <ArrowDown className="ml-2 h-4 w-4" />;
	};

	const getStatusColor = (status: StaffMember["status"]) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "on-leave":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case "offsite":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("name")}
								className="h-8 px-2 lg:px-3"
							>
								Name
								<SortIcon field="name" />
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("role")}
								className="h-8 px-2 lg:px-3"
							>
								Role
								<SortIcon field="role" />
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("department")}
								className="h-8 px-2 lg:px-3"
							>
								Department
								<SortIcon field="department" />
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("certifications")}
								className="h-8 px-2 lg:px-3"
							>
								Certifications
								<SortIcon field="certifications" />
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("yearsExperience")}
								className="h-8 px-2 lg:px-3"
							>
								Experience
								<SortIcon field="yearsExperience" />
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("status")}
								className="h-8 px-2 lg:px-3"
							>
								Status
								<SortIcon field="status" />
							</Button>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedStaff.map((member) => (
						<TableRow key={member.id}>
							<TableCell className="font-medium">{member.name}</TableCell>
							<TableCell>{member.role}</TableCell>
							<TableCell>{member.department}</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									{member.certifications.slice(0, 2).map((cert) => (
										<Badge key={cert} variant="outline" className="text-xs">
											{cert}
										</Badge>
									))}
									{member.certifications.length > 2 && (
										<Badge variant="secondary" className="text-xs">
											+{member.certifications.length - 2}
										</Badge>
									)}
								</div>
							</TableCell>
							<TableCell>{member.yearsExperience} years</TableCell>
							<TableCell>
								<Badge className={getStatusColor(member.status)}>
									{member.status}
								</Badge>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
