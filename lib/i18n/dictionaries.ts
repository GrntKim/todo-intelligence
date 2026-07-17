export type Locale = "ko" | "en";

export type Dictionary = {
  languageSwitcher: { label: string; ko: string; en: string };
  footer: { emailLabel: string; githubLabel: string };
  metadata: { title: string; description: string };
  home: { title: string; signOut: string };
  auth: {
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    submitSignIn: string;
    submitSignUp: string;
    submitPending: string;
    switchToSignUp: string;
    switchToSignIn: string;
    confirmationSent: string;
  };
  todo: {
    titlePlaceholder: string;
    contentPlaceholder: string;
    saving: string;
    add: string;
    empty: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    dueLabel: string;
    completedAriaSuffix: string;
    errors: {
      titleRequired: string;
      titleTooLong: (max: number) => string;
      contentTooLong: (max: number) => string;
      invalidDue: string;
      createFailed: string;
      notFound: string;
      updateFailed: string;
      toggleFailed: string;
      deleteFailed: string;
    };
  };
  summary: {
    heading: string;
    periodTabsLabel: string;
    dayTab: string;
    weekTab: string;
    todoCount: (n: number) => string;
    generate: (period: "day" | "week") => string;
    generating: string;
    adviceLabel: string;
    generatedAtLabel: string;
    empty: string;
    cachedNotice: string;
    errors: {
      invalidPeriod: string;
      noTodos: string;
      authFailed: string;
      rateLimited: string;
      timeout: string;
      apiFailed: string;
      unexpected: string;
      noText: string;
    };
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ko: {
    languageSwitcher: { label: "언어 선택", ko: "한국어", en: "English" },
    footer: { emailLabel: "이메일", githubLabel: "GitHub" },
    metadata: {
      title: "todo-intelligence",
      description: "AI가 요약하고 조언하는 할 일 관리 앱",
    },
    home: { title: "할 일", signOut: "로그아웃" },
    auth: {
      signIn: "로그인",
      signUp: "회원가입",
      email: "이메일",
      password: "비밀번호",
      submitSignIn: "로그인",
      submitSignUp: "가입하기",
      submitPending: "처리 중…",
      switchToSignUp: "계정이 없나요? 회원가입",
      switchToSignIn: "이미 계정이 있나요? 로그인",
      confirmationSent: "확인 메일을 보냈습니다. 메일함을 확인해주세요.",
    },
    todo: {
      titlePlaceholder: "제목 (50자 이내)",
      contentPlaceholder: "내용 (200자 이내)",
      saving: "저장 중…",
      add: "추가",
      empty: "할 일이 없습니다. 위에서 추가해보세요.",
      cancel: "취소",
      save: "저장",
      edit: "수정",
      delete: "삭제",
      dueLabel: "마감",
      completedAriaSuffix: "완료 여부",
      errors: {
        titleRequired: "제목을 입력해주세요.",
        titleTooLong: (max) => `제목은 ${max}자 이하여야 합니다.`,
        contentTooLong: (max) => `내용은 ${max}자 이하여야 합니다.`,
        invalidDue: "마감일 형식이 올바르지 않습니다.",
        createFailed: "할 일을 추가하지 못했습니다.",
        notFound: "할 일을 찾을 수 없습니다.",
        updateFailed: "할 일을 수정하지 못했습니다.",
        toggleFailed: "상태를 변경하지 못했습니다.",
        deleteFailed: "할 일을 삭제하지 못했습니다.",
      },
    },
    summary: {
      heading: "AI 요약",
      periodTabsLabel: "요약 기간",
      dayTab: "일",
      weekTab: "주",
      todoCount: (n) => `이 기간의 할 일 ${n}개`,
      generate: (period) => `${period === "day" ? "하루" : "일주일"} 요약 생성`,
      generating: "요약 생성 중…",
      adviceLabel: "조언",
      generatedAtLabel: "생성",
      empty: "아직 요약이 없습니다. 위 버튼으로 생성해보세요.",
      cachedNotice: "할 일이 변하지 않아 마지막 요약을 다시 표시합니다.",
      errors: {
        invalidPeriod: "기간은 하루 또는 일주일만 선택할 수 있습니다.",
        noTodos: "요약할 미완료 할 일이 없습니다.",
        authFailed: "AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요.",
        rateLimited: "요청이 많습니다. 잠시 후 다시 시도해주세요.",
        timeout: "요약 요청이 시간을 초과했습니다. 잠시 후 다시 시도해주세요.",
        apiFailed: "요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
        unexpected: "요약 생성 중 문제가 발생했습니다. 다시 시도해주세요.",
        noText: "요약 결과를 받지 못했습니다. 다시 시도해주세요.",
      },
    },
  },
  en: {
    languageSwitcher: { label: "Language", ko: "한국어", en: "English" },
    footer: { emailLabel: "Email", githubLabel: "GitHub" },
    metadata: {
      title: "todo-intelligence",
      description: "A to-do app with AI-generated summaries and advice",
    },
    home: { title: "To-dos", signOut: "Sign out" },
    auth: {
      signIn: "Sign in",
      signUp: "Sign up",
      email: "Email",
      password: "Password",
      submitSignIn: "Sign in",
      submitSignUp: "Sign up",
      submitPending: "Working…",
      switchToSignUp: "No account? Sign up",
      switchToSignIn: "Already have an account? Sign in",
      confirmationSent: "Confirmation email sent. Please check your inbox.",
    },
    todo: {
      titlePlaceholder: "Title (max 50 chars)",
      contentPlaceholder: "Details (max 200 chars)",
      saving: "Saving…",
      add: "Add",
      empty: "No to-dos yet. Add one above.",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      dueLabel: "Due",
      completedAriaSuffix: "completed",
      errors: {
        titleRequired: "Please enter a title.",
        titleTooLong: (max) => `Title must be ${max} characters or fewer.`,
        contentTooLong: (max) => `Details must be ${max} characters or fewer.`,
        invalidDue: "Invalid due date format.",
        createFailed: "Failed to add the to-do.",
        notFound: "To-do not found.",
        updateFailed: "Failed to update the to-do.",
        toggleFailed: "Failed to change the status.",
        deleteFailed: "Failed to delete the to-do.",
      },
    },
    summary: {
      heading: "AI Summary",
      periodTabsLabel: "Summary period",
      dayTab: "Day",
      weekTab: "Week",
      todoCount: (n) => `${n} to-do(s) in this period`,
      generate: (period) => `Generate ${period === "day" ? "daily" : "weekly"} summary`,
      generating: "Generating summary…",
      adviceLabel: "Advice",
      generatedAtLabel: "Generated",
      empty: "No summary yet. Generate one with the button above.",
      cachedNotice: "To-dos haven't changed, showing the last summary again.",
      errors: {
        invalidPeriod: "Period must be either day or week.",
        noTodos: "There are no incomplete to-dos to summarize.",
        authFailed: "AI service authentication failed. Please contact an administrator.",
        rateLimited: "Too many requests. Please try again shortly.",
        timeout: "The summary request timed out. Please try again shortly.",
        apiFailed: "Failed to generate the summary. Please try again shortly.",
        unexpected: "Something went wrong generating the summary. Please try again.",
        noText: "Didn't receive a summary result. Please try again.",
      },
    },
  },
};
