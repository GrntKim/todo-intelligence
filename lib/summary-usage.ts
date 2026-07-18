import { prisma } from "@/lib/prisma";

export const DAILY_LIMIT = 10;
export const WEEKLY_LIMIT = 40;

export type SummaryUsage = {
  daily: { used: number; limit: number };
  weekly: { used: number; limit: number };
};

export async function getSummaryUsage(userId: string): Promise<SummaryUsage> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [dailyCount, weeklyCount] = await Promise.all([
    prisma.summary.count({ where: { userId, requestedAt: { gte: dayAgo } } }),
    prisma.summary.count({ where: { userId, requestedAt: { gte: weekAgo } } }),
  ]);
  return {
    daily: { used: dailyCount, limit: DAILY_LIMIT },
    weekly: { used: weeklyCount, limit: WEEKLY_LIMIT },
  };
}
