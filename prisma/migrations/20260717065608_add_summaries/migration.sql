-- CreateEnum
CREATE TYPE "summary_period" AS ENUM ('day', 'week');

-- CreateTable
CREATE TABLE "summaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "period" "summary_period" NOT NULL,
    "summary" JSONB NOT NULL,
    "todos" JSONB NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "summaries_user_id_requested_at_idx" ON "summaries"("user_id", "requested_at" DESC);

-- Extend the auth.users delete-cascade trigger function (added by hand —
-- Prisma does not manage functions/triggers) to also clean up summaries.
-- The trigger itself already exists on auth.users; replacing the function
-- body is enough, both here and in the shadow DB replay.
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.todos WHERE user_id = OLD.id;
  DELETE FROM public.summaries WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$;
