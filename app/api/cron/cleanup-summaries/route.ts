import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RETENTION_DAYS = 30;

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.summary.deleteMany({
    where: { requestedAt: { lt: cutoff } },
  });

  return NextResponse.json({ deleted: count });
}
