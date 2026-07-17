"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import type { Todo } from "@prisma/client";
import {
  createTodo,
  deleteTodo,
  toggleTodo,
  updateTodo,
} from "@/app/actions/todos";

type OptimisticTodo = Todo & { pending?: boolean };

type OptimisticAction =
  | { type: "add"; todo: OptimisticTodo }
  | { type: "toggle"; id: string; completed: boolean }
  | { type: "update"; id: string; title: string; content: string; due: Date | null }
  | { type: "delete"; id: string };

function reducer(
  todos: OptimisticTodo[],
  action: OptimisticAction,
): OptimisticTodo[] {
  switch (action.type) {
    case "add":
      return [action.todo, ...todos];
    case "toggle":
      return todos.map((t) =>
        t.id === action.id ? { ...t, completed: action.completed, pending: true } : t,
      );
    case "update":
      return todos.map((t) =>
        t.id === action.id
          ? { ...t, title: action.title, content: action.content, due: action.due, pending: true }
          : t,
      );
    case "delete":
      return todos.filter((t) => t.id !== action.id);
  }
}

function formatDue(due: Date): string {
  const d = new Date(due);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TodoApp({ initialTodos }: { initialTodos: Todo[] }) {
  const [optimisticTodos, applyOptimistic] = useOptimistic(
    initialTodos as OptimisticTodo[],
    reducer,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleCreate(formData: FormData) {
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    const dueRaw = String(formData.get("due") ?? "");
    const due = dueRaw ? new Date(dueRaw) : null;

    formRef.current?.reset();
    setError(null);

    startTransition(async () => {
      applyOptimistic({
        type: "add",
        todo: {
          id: `optimistic-${Date.now()}`,
          userId: "",
          title,
          content,
          due,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          pending: true,
        },
      });
      const result = await createTodo({
        title,
        content,
        due: due ? due.toISOString() : null,
      });
      if (!result.ok) setError(result.error);
    });
  }

  function handleToggle(todo: OptimisticTodo) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: "toggle", id: todo.id, completed: !todo.completed });
      const result = await toggleTodo(todo.id, !todo.completed);
      if (!result.ok) setError(result.error);
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const result = await deleteTodo(id);
      if (!result.ok) setError(result.error);
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    const dueRaw = String(formData.get("due") ?? "");
    const due = dueRaw ? new Date(dueRaw) : null;

    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: "update", id, title, content, due });
      const result = await updateTodo(id, {
        title,
        content,
        due: due ? due.toISOString() : null,
      });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        ref={formRef}
        action={handleCreate}
        className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15"
      >
        <input
          name="title"
          required
          maxLength={50}
          placeholder="제목 (50자 이내)"
          className="rounded border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <textarea
          name="content"
          maxLength={200}
          rows={2}
          placeholder="내용 (200자 이내)"
          className="rounded border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <div className="flex items-center gap-2">
          <input
            name="due"
            type="datetime-local"
            className="rounded border border-black/15 bg-transparent px-3 py-1.5 text-sm dark:border-white/20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="ml-auto rounded bg-foreground px-4 py-1.5 text-sm font-medium text-background disabled:opacity-50"
          >
            {isPending ? "저장 중…" : "추가"}
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {optimisticTodos.length === 0 && (
          <li className="py-8 text-center text-sm text-black/40 dark:text-white/40">
            할 일이 없습니다. 위에서 추가해보세요.
          </li>
        )}
        {optimisticTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => handleToggle(todo)}
            onDelete={() => handleDelete(todo.id)}
            onUpdate={(formData) => handleUpdate(todo.id, formData)}
          />
        ))}
      </ul>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdate,
}: {
  todo: OptimisticTodo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-lg border border-black/10 p-3 dark:border-white/15">
        <form
          action={(formData) => {
            setEditing(false);
            onUpdate(formData);
          }}
          className="flex flex-col gap-2"
        >
          <input
            name="title"
            required
            maxLength={50}
            defaultValue={todo.title}
            className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
          />
          <textarea
            name="content"
            maxLength={200}
            rows={2}
            defaultValue={todo.content}
            className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
          />
          <div className="flex items-center gap-2">
            <input
              name="due"
              type="datetime-local"
              defaultValue={todo.due ? formatDue(todo.due).replace(" ", "T") : ""}
              className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
            />
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded px-3 py-1 text-sm text-black/60 dark:text-white/60"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded bg-foreground px-3 py-1 text-sm font-medium text-background"
              >
                저장
              </button>
            </div>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`flex items-start gap-3 rounded-lg border border-black/10 p-3 transition-opacity dark:border-white/15 ${
        todo.pending ? "opacity-50" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
        aria-label={`${todo.title} 완료 여부`}
        className="mt-1 size-4 accent-foreground"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-medium ${
            todo.completed ? "text-black/40 line-through dark:text-white/40" : ""
          }`}
        >
          {todo.title}
        </p>
        {todo.content && (
          <p className="mt-0.5 break-words text-sm text-black/60 dark:text-white/60">
            {todo.content}
          </p>
        )}
        {todo.due && (
          <time
            suppressHydrationWarning
            className="mt-1 block text-xs text-black/40 dark:text-white/40"
          >
            마감: {formatDue(todo.due)}
          </time>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded px-2 py-1 text-xs text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          수정
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          삭제
        </button>
      </div>
    </li>
  );
}
