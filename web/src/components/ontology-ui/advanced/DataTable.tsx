/**
 * DataTable - Advanced data table with sorting, filtering, pagination
 *
 * Uses 6-token design system for data tables.
 */

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "../utils";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchable?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * DataTable - Feature-rich data table
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={products}
 *   columns={[
 *     { key: "name", label: "Name", sortable: true },
 *     { key: "price", label: "Price", sortable: true, render: (row) => `$${row.price}` },
 *     { key: "stock", label: "Stock", sortable: true }
 *   ]}
 *   searchable
 *   pageSize={10}
 *   onRowClick={(product) => navigate(`/products/${product.id}`)}
 * />
 * ```
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  searchable = true,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="h-4 w-4" />;
    if (sortOrder === "asc") return <ChevronUp className="h-4 w-4" />;
    return <ChevronDown className="h-4 w-4" />;
  };

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <CardContent className="bg-foreground p-4 rounded-md">
        {/* Search */}
        {searchable && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-font/40" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className="pl-9"
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-2 font-medium hover:text-font"
                      >
                        {column.label}
                        {getSortIcon(column.key)}
                      </button>
                    ) : (
                      <span className="font-medium">{column.label}</span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, i) => (
                  <TableRow
                    key={i}
                    onClick={() => onRowClick?.(row)}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render
                          ? column.render(row)
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-font/60"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-font/60">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
              {sortedData.length} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
