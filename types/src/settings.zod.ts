import { z } from "zod";

export const SettingsSchema = z.object({
  soundEnabled: z.boolean().default(true),
  typingSoundEnabled: z.boolean().default(true),
});
export type Settings = z.infer<typeof SettingsSchema>;
export type SettingsUpdate = Partial<Settings>;
