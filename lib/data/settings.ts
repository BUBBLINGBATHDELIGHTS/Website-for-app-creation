import { z } from 'zod';
import { mutateJsonFile, readJsonFile } from './fs-store';

const SETTINGS_FILE = 'settings.json';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  passwordHash: z.string().min(10),
  roles: z.array(z.enum(['admin', 'employee'])),
  lastLoginAt: z.string().nullable().default(null),
});

const loyaltyTierSchema = z.object({
  id: z.string().min(1),
  threshold: z.number().nonnegative(),
  benefit: z.string().min(1),
});

const loyaltySchema = z.object({
  tiers: z.array(loyaltyTierSchema).default([]),
  signupBonus: z.number().nonnegative().default(0),
  referralBonus: z.number().nonnegative().default(0),
});

export const settingsSchema = z.object({
  adminUsers: z.array(userSchema).default([]),
  employeeUsers: z.array(userSchema).default([]),
  loyalty: loyaltySchema.default({ tiers: [], signupBonus: 0, referralBonus: 0 }),
});

export type Settings = z.infer<typeof settingsSchema>;

async function readSettings() {
  return readJsonFile<Settings>(SETTINGS_FILE, { adminUsers: [], employeeUsers: [], loyalty: { tiers: [], signupBonus: 0, referralBonus: 0 } });
}

export async function getSettings() {
  return readSettings();
}

export async function updateLastLogin(email: string, role: 'adminUsers' | 'employeeUsers') {
  await mutateJsonFile<Settings>(
    SETTINGS_FILE,
    (settings) => {
      const next = settingsSchema.parse(settings);
      next[role] = next[role].map((user) =>
        user.email === email ? { ...user, lastLoginAt: new Date().toISOString() } : user,
      );
      return next;
    },
    { adminUsers: [], employeeUsers: [], loyalty: { tiers: [], signupBonus: 0, referralBonus: 0 } },
  );
}
