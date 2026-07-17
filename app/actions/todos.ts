"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";

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

function validateInput(input: TodoInput):
  | { ok: true; data: { title: string; content: string; due: Date | null } }
  | { ok: false; error: string } {
  const title = input.title.trim();
  const content = input.content.trim();

  if (title.length === 0) return { ok: false, error: "제목을 입력해주세요." };
  if (title.length > TITLE_MAX)
    return { ok: false, error: `제목은 ${TITLE_MAX}자 이하여야 합니다.` };
  if (content.length > CONTENT_MAX)
    return { ok: false, error: `내용은 ${CONTENT_MAX}자 이하여야 합니다.` };

  let due: Date | null = null;
  if (input.due) {
    due = new Date(input.due);
    if (Number.isNaN(due.getTime()))
      return { ok: false, error: "마감일 형식이 올바르지 않습니다." };
  }

  return { ok: true, data: { title, content, due } };
}

export async function createTodo(input: TodoInput): Promise<ActionResult> {
  const userId = await requireUserId();

  const validated = validateInput(input);
  if (!validated.ok) return validated;

  try {
    await prisma.todo.create({
      data: { ...validated.data, userId },
    });
  } catch {
    return { ok: false, error: "할 일을 추가하지 못했습니다." };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function toggleTodo(
  id: string,
  completed: boolean,
): Promise<ActionResult> {
  const userId = await requireUserId();

  try {
    const { count } = await prisma.todo.updateMany({
      where: { id, userId },
      data: { completed },
    });
    if (count === 0)
      return { ok: false, error: "할 일을 찾을 수 없습니다." };
  } catch {
    return { ok: false, error: "상태를 변경하지 못했습니다." };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function updateTodo(
  id: string,
  input: TodoInput,
): Promise<ActionResult> {
  const userId = await requireUserId();

  const validated = validateInput(input);
  if (!validated.ok) return validated;

  try {
    const { count } = await prisma.todo.updateMany({
      where: { id, userId },
      data: validated.data,
    });
    if (count === 0)
      return { ok: false, error: "할 일을 찾을 수 없습니다." };
  } catch {
    return { ok: false, error: "할 일을 수정하지 못했습니다." };
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteTodo(id: string): Promise<ActionResult> {
  const userId = await requireUserId();

  try {
    const { count } = await prisma.todo.deleteMany({
      where: { id, userId },
    });
    if (count === 0)
      return { ok: false, error: "할 일을 찾을 수 없습니다." };
  } catch {
    return { ok: false, error: "할 일을 삭제하지 못했습니다." };
  }

  revalidatePath("/");
  return { ok: true };
}
