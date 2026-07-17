-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "todos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "content" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "due" TIMESTAMPTZ(6),
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "todos_user_id_idx" ON "todos"("user_id");

-- Shadow DB bootstrap: Supabase provisions auth.users in the real database,
-- but the shadow database used by `migrate dev` starts empty. Create a
-- minimal stub there so the trigger below can be created. No-op on the real DB.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    CREATE SCHEMA IF NOT EXISTS "auth";
    CREATE TABLE "auth"."users" ("id" UUID NOT NULL PRIMARY KEY);
  END IF;
END $$;

-- Cascade cleanup via trigger instead of a foreign key: a cross-schema FK to
-- auth.users breaks Prisma introspection (P4002), and Prisma does not
-- introspect triggers/functions, so this stays invisible to migrate dev.
-- SECURITY DEFINER lets the function delete from public.todos even when the
-- deleting role (supabase_auth_admin) has no direct grant on that table.
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.todos WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_user();

