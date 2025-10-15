-- Seed initial application data for development and testing.
-- Adds one user per available role and a small variety of catalog products.

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
