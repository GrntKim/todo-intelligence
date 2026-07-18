# todo.ai

AI가 할 일을 일간/주간으로 요약하고 조언까지 해주는 to-do 리스트 앱.

## Features

- 할 일 추가/수정/완료/삭제 (제목 50자, 내용 200자 제한, 마감일 지정 가능)
- Claude 기반 AI 요약 + 조언, 일간/주간 단위로 생성
- 동일한 할 일 목록 재요청 시 이전 요약 재사용 (불필요한 API 호출 방지)
- 유저당 요약 생성 한도 (10회/일, 40회/주) — 헤더 이메일에 마우스를 올리면 남은 사용량 확인 가능
- 30일 지난 요약 자동 삭제 (Vercel Cron)
- 한국어 / 영어 지원, 라이트 / 다크 테마

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript (strict)
- [Supabase](https://supabase.com) — Auth + Postgres
- [Prisma](https://www.prisma.io) ORM
- [Tailwind CSS](https://tailwindcss.com)
- [Anthropic Claude SDK](https://docs.anthropic.com)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables — copy `.env.example` to `.env` and fill in real values (Supabase project settings, Anthropic API key, etc.):

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   | --- | --- |
   | `DATABASE_URL` | Pooled Postgres connection (PgBouncer, used at runtime by Prisma Client) |
   | `DIRECT_URL` | Direct Postgres connection (used by Prisma Migrate/db push) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `ANTHROPIC_API_KEY` | Server-only Anthropic API key for AI summaries |
   | `CONTACT_EMAIL` | Email shown in the footer |
   | `GITHUB_URL` | GitHub link shown in the footer |
   | `CRON_SECRET` | Authorizes Vercel Cron requests to `/api/cron/*` |

3. Sync the database schema:

   ```bash
   npx prisma db push
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Browse the database |
| `npx prisma db push` | Sync Prisma schema to the database |

## Project Structure

- `app/actions/` — Server Actions (todos, AI summaries, auth, theme, locale)
- `app/components/` — UI components
- `app/api/cron/` — Vercel Cron endpoints (e.g. old-summary cleanup)
- `lib/` — shared server/client utilities (Prisma client, Supabase clients, i18n dictionaries, auth helper, summary usage & fingerprint, Seoul-time helpers)
- `prisma/schema.prisma` — database schema (`Todo`, `Summary` models)

## Deploy

Deploy on [Vercel](https://vercel.com/new). Make sure all environment variables above are set in the project settings, and that Vercel Cron is enabled for scheduled summary cleanup.
