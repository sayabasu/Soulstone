
-- Initial schema creation ----------------------------------------------------

CREATE TABLE IF NOT EXISTS "User" (
  "id"           TEXT      NOT NULL,
  "name"         TEXT      NOT NULL,
  "email"        TEXT      NOT NULL,
  "passwordHash" TEXT      NOT NULL,
  "role"         TEXT      NOT NULL DEFAULT 'customer',
  "createdAt"    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");

CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT      NOT NULL,
  "name"        TEXT      NOT NULL,
  "description" TEXT      NOT NULL,
  "price"       DECIMAL(10, 2) NOT NULL,
  "imageUrl"    TEXT      NOT NULL,
  "tags"        TEXT[]    NOT NULL,
  "isPublished" BOOLEAN   NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Order" (
  "id"        TEXT      NOT NULL,
  "userId"    TEXT      NOT NULL,
  "status"    TEXT      NOT NULL DEFAULT 'pending',
  "total"     DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order" ("userId");

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id"        TEXT      NOT NULL,
  "orderId"   TEXT      NOT NULL,
  "productId" TEXT      NOT NULL,
  "quantity"  INTEGER   NOT NULL,
  "price"     DECIMAL(10, 2) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem" ("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem" ("productId");

INSERT INTO "User" ("id", "name", "email", "passwordHash", "role")
VALUES
  ('f9a63c9f-78a0-4aa3-86db-56b6ec8411ab', 'Aether Admin', 'admin@soulstone.dev', '$2a$10$.Zp9RD1aotqxCAWTFDNzleOI7IsBi9uUrMk07KEKt7T7aPipbCVMe', 'admin'),
  ('ac8f9a65-680f-432e-9d5a-682c9db1e9c1', 'Sylas Staff', 'staff@soulstone.dev', '$2a$10$.Zp9RD1aotqxCAWTFDNzleOI7IsBi9uUrMk07KEKt7T7aPipbCVMe', 'staff'),
  ('e2f4f4a2-1c6f-4e11-9d8c-5f0e3f3bd4d2', 'Lyra Customer', 'customer@soulstone.dev', '$2a$10$.Zp9RD1aotqxCAWTFDNzleOI7IsBi9uUrMk07KEKt7T7aPipbCVMe', 'customer')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Product" ("id", "name", "description", "price", "imageUrl", "tags", "isPublished")
VALUES
  ('b01a1ec2-3d27-4ba1-beb7-08f55c4e3538', 'Arcane Focus Tee', 'Soft cotton tee infused with arcane runes for marathon gaming sessions.', 29.99, 'https://cdn.soulstone.dev/products/arcane-focus-tee.jpg', '{"apparel","featured"}'::text[], true),
  ('d67e3b6a-43aa-4f25-8e38-3c09b27d7fd1', 'Mageblood Energy Drink Pack', 'Twelve-pack of the guild''s favorite energy potion with a citrus kick.', 19.49, 'https://cdn.soulstone.dev/products/mageblood-energy-pack.jpg', '{"beverage","bundle"}'::text[], true),
  ('5df1c078-6a05-4f1a-9f94-835bfdfb76a0', 'Runic Precision Mouse Pad', 'Oversized mouse pad etched with precision runes for flawless aim.', 49.50, 'https://cdn.soulstone.dev/products/runic-mouse-pad.jpg', '{"accessories","esports"}'::text[], true),
  ('c58a6a40-7c7a-4a14-83a4-5124a4c47db4', 'Shadowstep Sneakers', 'Lightweight sneakers designed for quick pivots and stealthy moves.', 119.00, 'https://cdn.soulstone.dev/products/shadowstep-sneakers.jpg', '{"apparel","limited"}'::text[], false)
ON CONFLICT ("id") DO NOTHING;
