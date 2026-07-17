import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import TodoApp from "@/app/components/todo-app";

export default async function Home() {
  const userId = await requireUserId();

  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 p-8">
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
      <TodoApp initialTodos={todos} />
    </main>
  );
}
