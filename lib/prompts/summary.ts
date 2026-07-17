export type SummaryPeriod = "day" | "week";

export const PERIOD_LABEL: Record<SummaryPeriod, string> = {
  day: "하루",
  week: "일주일",
};

export const SUMMARY_SYSTEM_PROMPT = `당신은 사용자의 할 일 목록을 요약하는 비서입니다.

할일 목록을 읽어 우선순위와 한 줄 조언을 담아 요약해주세요.

규칙:
- 기간: 하루 또는 일주일 (사용자 메시지에 명시됨)
- 톤: 존댓말
- 길이: summary는 목록 전체를 아우르는 요약 하나, advice는 최대 2문장(조언과 그 근거)
- 마감이 지났거나 임박한 항목을 우선순위 판단에 반영해주세요.

출력 필드:
- period: 요약 대상 기간 ("하루" 또는 "일주일")
- summary: 우선순위를 담은 할 일 목록 요약
- advice: 한 줄 조언 (최대 2문장, 조언/근거)`;

export type SummaryTodoInput = {
  title: string;
  content: string;
  due: Date | null;
};

export function buildSummaryUserPrompt(
  period: SummaryPeriod,
  todos: SummaryTodoInput[],
  now: Date = new Date(),
): string {
  const lines = todos.map((todo, i) => {
    let dueText = "마감 없음";
    if (todo.due) {
      const overdue = todo.due.getTime() < now.getTime();
      dueText = `마감: ${todo.due.toISOString()}${overdue ? " (기한 지남)" : ""}`;
    }
    const content = todo.content ? ` — ${todo.content}` : "";
    return `${i + 1}. ${todo.title}${content} [${dueText}]`;
  });

  return `기간: ${PERIOD_LABEL[period]}
현재 시각: ${now.toISOString()}

미완료 할 일 목록:
${lines.join("\n")}`;
}

// Mirrors the shape the user specified: { "result": { period, summary, advice } }
export const SUMMARY_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    result: {
      type: "object",
      properties: {
        period: { type: "string" },
        summary: { type: "string" },
        advice: { type: "string" },
      },
      required: ["period", "summary", "advice"],
      additionalProperties: false,
    },
  },
  required: ["result"],
  additionalProperties: false,
} as const;
