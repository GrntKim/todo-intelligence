"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Prisma connects as the postgres role and bypasses RLS, so every query in
// this file MUST scope its where clause with the session userId. Single-row
// mutations use updateMany/deleteMany so ownership lives in the WHERE clause
// itself — a mismatched userId yields count 0 instead of touching the row.

export type ActionResult = { ok: true } | { ok: false; error: string };

const TITLE_MAX = 50;
const CONTENT_MAX = 200;

type TodoInput = {
  title: string;
  content: string;
  due: string | null; // ISO string or null
};

function validateInput(
  input: TodoInput,
  errors: Dictionary["todo"]["errors"],
):
  | { ok: true; data: { title: string; content: string; due: Date | null } }
  | { ok: false; error: string } {
  const title = input.title.trim();
  const content = input.content.trim();

  if (title.length === 0) return { ok: false, error: errors.titleRequired };
  if (title.length > TITLE_MAX)
    return { ok: false, error: errors.titleTooLong(TITLE_MAX) };
  if (content.length > CONTENT_MAX)
    return { ok: false, error: errors.contentTooLong(CONTENT_MAX) };

  let due: Date | null = null;
  if (input.due) {
    due = new Date(input.due);
    if (Number.isNaN(due.getTime()))
      return { ok: false, error: errors.invalidDue };
  }

  return { ok: true, data: { title, content, due } };
}

export async function createTodo(input: TodoInput): Promise<ActionResult> {
  const userId = await requireUserId();
  const { errors } = getDictionary(await getLocale()).todo;

  const validated = validateInput(input, errors);
  if (!validated.ok) return validated;

  try {
    await prisma.todo.create({
      data: { ...validated.data, userId },
    });
  } catch {
    return { ok: false, error: errors.createFailed };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function toggleTodo(
  id: string,
  completed: boolean,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const { errors } = getDictionary(await getLocale()).todo;

  try {
    const { count } = await prisma.todo.updateMany({
      where: { id, userId },
      data: { completed },
    });
    if (count === 0) return { ok: false, error: errors.notFound };
  } catch {
    return { ok: false, error: errors.toggleFailed };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function updateTodo(
  id: string,
  input: TodoInput,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const { errors } = getDictionary(await getLocale()).todo;

  const validated = validateInput(input, errors);
  if (!validated.ok) return validated;

  try {
    const { count } = await prisma.todo.updateMany({
      where: { id, userId },
      data: validated.data,
    });
    if (count === 0) return { ok: false, error: errors.notFound };
  } catch {
    return { ok: false, error: errors.updateFailed };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteTodo(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const { errors } = getDictionary(await getLocale()).todo;

  try {
    const { count } = await prisma.todo.deleteMany({
      where: { id, userId },
    });
    if (count === 0) return { ok: false, error: errors.notFound };
  } catch {
    return { ok: false, error: errors.deleteFailed };
  }

  revalidatePath("/");
  return { ok: true };
}
