import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { GameConfig } from ".";

export function GameSettings({
	config,
	setConfig,
	solo,
}: {
	config: GameConfig;
	setConfig: (config: GameConfig) => void;
	solo?: boolean;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Settings className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="w-sm">
				<DialogHeader>
					<DialogTitle>Game Settings</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col">
					{solo ? null : (
						<>
							<div className="flex items-center justify-between py-2">
								<Label htmlFor="show-opp-cursors">Show opponent cursors</Label>
								<Switch
									checked={config.showOppCursors}
									onCheckedChange={(checked) =>
										setConfig({ ...config, showOppCursors: checked })
									}
								/>
							</div>

							<div className="flex items-center justify-between py-2">
								<Label htmlFor="show-opp-cursors">Enable confetti on win</Label>
								<Switch
									checked={config.enableConfetti}
									onCheckedChange={(checked) =>
										setConfig({ ...config, enableConfetti: checked })
									}
								/>
							</div>
						</>
					)}
					<div className="flex items-center justify-between py-2">
						<Label htmlFor="show-opp-cursors">Enable streak display</Label>
						<Switch
							checked={config.enableStreak}
							onCheckedChange={(checked) =>
								setConfig({ ...config, enableStreak: checked })
							}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
