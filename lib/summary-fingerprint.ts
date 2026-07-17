export type FingerprintTodo = {
  id: string;
  title: string;
  content: string;
  due: string | Date | null;
};

/**
 * Deterministic fingerprint of a todo list for summary dedup.
 *
 * Includes each todo's overdue state relative to `at` — the stored snapshot
 * is fingerprinted against its summary's requestedAt and the current list
 * against now, so a deadline passing between the two requests changes the
 * fingerprint and allows regeneration even when the list itself is unchanged.
 */
export function summaryFingerprint(
  todos: FingerprintTodo[],
  at: Date,
): string {
  return todos
    .map((t) => {
      const due = t.due ? new Date(t.due) : null;
      const overdue = due !== null && due.getTime() < at.getTime();
      return JSON.stringify([
        t.id,
        t.title,
        t.content,
        due ? due.toISOString() : null,
        overdue,
      ]);
    })
    .sort()
    .join("\n");
}
