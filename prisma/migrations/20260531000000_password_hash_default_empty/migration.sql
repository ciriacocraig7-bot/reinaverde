-- passwordHash now defaults to empty string for guest users created during
-- checkout. They cannot log in until they activate the account via the
-- email link (which calls /api/auth/reset and sets a real hash).
ALTER TABLE "users" ALTER COLUMN "passwordHash" SET DEFAULT '';
