ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "slug" TEXT;

UPDATE "Product"
SET "slug" = trim(both '-' from lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g')))
WHERE "slug" IS NULL;

UPDATE "Product"
SET "slug" = concat('product-', substr(md5("id"), 1, 8))
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "Product"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product" ("slug");
