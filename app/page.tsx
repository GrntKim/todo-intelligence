import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import TodoApp from "@/app/components/todo-app";
import SummaryPanel, {
  type InitialSummaries,
  type SummaryView,
} from "@/app/components/summary-panel";
import type { TodoSummary } from "@/app/actions/summarize";
import type { SummaryPeriod } from "@/lib/prompts/summary";

async function latestSummary(
  userId: string,
  period: SummaryPeriod,
): Promise<SummaryView | undefined> {
  const row = await prisma.summary.findFirst({
    where: { userId, period },
    orderBy: { requestedAt: "desc" },
    select: { summary: true, requestedAt: true },
  });
  if (!row) return undefined;
  return {
    ...(row.summary as TodoSummary),
    requestedAt: row.requestedAt.toISOString(),
  };
}

export default async function Home() {
  const userId = await requireUserId();

  // Request timestamp for the summary panel's period filter. Intentional in
  // a per-request server component; the purity rule targets client re-renders.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const [todos, daySummary, weekSummary] = await Promise.all([
    prisma.todo.findMany({
      where: { userId },
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
    }),
    latestSummary(userId, "day"),
    latestSummary(userId, "week"),
  ]);

  const initialSummaries: InitialSummaries = {
    day: daySummary,
    week: weekSummary,
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">할 일</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-black/60 underline dark:text-white/60"
          >
            로그아웃
          </button>
        </form>
      </header>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <TodoApp initialTodos={todos} />
        <SummaryPanel
          initialSummaries={initialSummaries}
          todos={todos}
          now={now}
        />
      </div>
    </main>
  );
}
