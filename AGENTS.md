<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Description
- **todo.ai**: A to-do list app that provides AI-generated summaries and and advice(grouped by day or week).

# Project Rules & Guidelines

## 1. Development Commands
- **Dev Server**: `npm run dev`
- **Build Project**: `npm run build`
- **Lint Check**: `npm run lint`
- **Prisma Studio**: `npx prisma studio`
- **Prisma Sync**: `npx prisma db push`

## 2. Tech Stack & Code Style
- **Framework**: Next.js (App Router)
- **Database/ORM**: Supabase with Prisma ORM
- **Language**: TypeScript (Strict Mode mandatory)
- **Styling**: Tailwind CSS
- **Formatting**: 2-space indentation

## 3. Strict Restrictions
- **No `any`**: Always define explicit and strict types/interfaces.
- **Security**: Never commit secrets, `.env` files, or API keys.
- **Dependencies**: Avoid external libraries for simple UI components; build natively with Tailwind.

## 4. Git & Session Management
- **Pre-task**: Check `CLAUDE.md` and recent commit messages before starting.
- **Context Control**: Use `/compact` command to compress tokens if context grows long.
- **Commit Frequency**: Divide work into buildable units. Commit immediately after completing a unit. And make a comprehensive report. 
- **Don't push by yourself**: I'll push after reading commit report.
- **Commit Format**: Use Conventional Commits (e.g., `feat: `, `fix: `, `refactor: `).

## 5. Communication Protocol
- Keep responses short, precise, and direct.
- Explain the "why" (rationale) briefly before showing code blocks.
- Ask clarifying questions immediately if any requirement is ambiguous.
