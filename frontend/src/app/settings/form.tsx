"use client";
import type { Settings } from "@versus-type/types";
import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { updateUserSettings } from "@/services/user.client";

export function SettingsForm({
	settingsData,
}: {
	settingsData: Promise<Settings>;
}) {
	const data = use(settingsData);
	const [settings, setSettings] = useState<Settings>(data);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [success, setSuccess] = useState(false);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		updateUserSettings(settings)
			.then(() => {
				setLoading(false);
				setSuccess(true);
				setTimeout(() => setSuccess(false), 3000);
			})
			.catch((err) => {
				setLoading(false);
				setError(err);
			});
	}

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

				<form onSubmit={handleSubmit} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Audio</CardTitle>
							<CardDescription>
								Configure sound settings for your typing experience
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="sound-enabled">Master Audio</Label>
									<p className="text-sm text-muted-foreground">
										Enable all game sounds and effects
									</p>
								</div>
								<Switch
									id="sound-enabled"
									checked={settings.soundEnabled}
									onCheckedChange={(checked) =>
										setSettings({ ...settings, soundEnabled: checked })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="typing-sound">Typing Sounds</Label>
									<p className="text-sm text-muted-foreground">
										Keyboard click sounds while typing
									</p>
								</div>
								<Switch
									id="typing-sound"
									checked={settings.typingSoundEnabled}
									onCheckedChange={(checked) =>
										setSettings({ ...settings, typingSoundEnabled: checked })
									}
								/>
							</div>
						</CardContent>
					</Card>

					{error && (
						<Card className="border-destructive">
							<CardContent className="pt-6">
								<div className="flex items-center space-x-2">
									<div className="text-destructive">
										<p className="font-medium">Error</p>
										<p className="text-sm">{error.message}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{success && (
						<Card className="border-green-500">
							<CardContent className="pt-6">
								<div className="flex items-center space-x-2">
									<div className="text-green-600">
										<p className="font-medium">Settings saved</p>
										<p className="text-sm">
											Your preferences have been updated
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					<Button type="submit" disabled={loading} className="w-full">
						{loading ? "Saving..." : "Save Settings"}
					</Button>
				</form>
			</div>
		</div>
	);
}
