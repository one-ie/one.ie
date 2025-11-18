import { AppProviders } from "@/components/providers/AppProviders";
import { MagicLinkAuth } from "./MagicLinkAuth";
import { RequestMagicLinkForm } from "./RequestMagicLinkForm";

export function MagicLinkPage({ token }: { token?: string | null }) {
	return (
		<AppProviders>
			{token ? <MagicLinkAuth token={token} /> : <RequestMagicLinkForm />}
		</AppProviders>
	);
}
