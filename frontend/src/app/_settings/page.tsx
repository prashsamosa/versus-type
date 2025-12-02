import { Separator } from "@/components/ui/separator";
import { getUserSettings } from "@/services/user.server";
import { SettingsForm } from "./form";
import { UsernameForm } from "./UsernameForm";

export default async function SettingsPage() {
	const settingsData = await getUserSettings();
	return (
		<div className="container max-w-2xl mx-auto py-8">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Settings</h1>
					<p className="text-muted-foreground">
						Manage your typing preferences
					</p>
				</div>

				<Separator />
				<UsernameForm />
				<SettingsForm settingsData={settingsData} />
			</div>
		</div>
	);
}
