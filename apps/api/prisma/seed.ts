import {
  AddressType,
  ArticleStatus,
  CartStatus,
  InventoryStatus,
  MediaType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  PrismaClient,
  ProductStatus,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

const money = (value: number) => new Prisma.Decimal(value);

async function resetDatabase() {
  await prisma.media.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.article.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
}

async function createSeedData() {
  const user = await prisma.user.create({
    data: {
      email: 'seed-user@soulstone.shop',
      phone: '+911234567890',
      passwordHash: 'placeholder-hash',
      firstName: 'Seed',
      lastName: 'User',
      role: UserRole.CUSTOMER,
    },
  });

  const shippingAddress = await prisma.address.create({
    data: {
      userId: user.id,
      type: AddressType.SHIPPING,
      label: 'Primary Residence',
      line1: '221B Seed Street',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'IN',
      isDefault: true,
    },
  });

  const billingAddress = await prisma.address.create({
    data: {
      userId: user.id,
      type: AddressType.BILLING,
      label: 'Billing HQ',
      line1: '100 Market Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'IN',
      isDefault: false,
    },
  });

  const collection = await prisma.collection.create({
    data: {
      slug: 'chakra-balancing',
      name: 'Chakra Balancing',
      description: 'Curated crystals supporting chakra alignment.',
    },
  });

  const amethyst = await prisma.product.create({
    data: {
      slug: 'amethyst-cluster',
      name: 'Amethyst Cluster',
      description: 'Calming amethyst cluster sourced from ethical mines.',
      status: ProductStatus.PUBLISHED,
      price: money(2499.0),
      currency: 'INR',
      weightGrams: 450,
      attributes: {
        chakra: 'Third Eye',
        origin: 'Brazil',
      },
      collections: {
        connect: [{ id: collection.id }],
      },
      media: {
        create: [
          {
            url: 'https://cdn.soulstone.shop/images/amethyst-cluster.jpg',
            type: MediaType.IMAGE,
            altText: 'Amethyst crystal cluster on white background',
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await prisma.inventory.create({
    data: {
      productId: amethyst.id,
      sku: 'CRY-AMETHYST-001',
      status: InventoryStatus.IN_STOCK,
      quantity: 40,
      safetyStock: 8,
      reorderPoint: 10,
    },
  });

  const roseQuartz = await prisma.product.create({
    data: {
      slug: 'rose-quartz-tower',
      name: 'Rose Quartz Tower',
      description: 'Heart chakra activator with a soothing pink finish.',
      status: ProductStatus.PUBLISHED,
      price: money(1899.0),
      currency: 'INR',
      weightGrams: 320,
      attributes: {
        chakra: 'Heart',
        origin: 'Madagascar',
      },
      collections: {
        connect: [{ id: collection.id }],
      },
    },
  });

  await prisma.inventory.create({
    data: {
      productId: roseQuartz.id,
      sku: 'CRY-ROSE-QUARTZ-001',
      status: InventoryStatus.BACKORDER,
      quantity: 5,
      safetyStock: 5,
      reorderPoint: 12,
      backorderLimit: 20,
    },
  });

  const cart = await prisma.cart.create({
    data: {
      userId: user.id,
      sessionId: 'seed-session-123',
      status: CartStatus.CHECKED_OUT,
      total: money(4398.0),
      currency: 'INR',
      items: {
        create: [
          {
            productId: amethyst.id,
            quantity: 1,
            unitPrice: money(2499.0),
          },
          {
            productId: roseQuartz.id,
            quantity: 1,
            unitPrice: money(1899.0),
          },
        ],
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: 'SOUL-100001',
      userId: user.id,
      cartId: cart.id,
      status: OrderStatus.DELIVERED,
      subtotal: money(4398.0),
      shippingFee: money(150.0),
      tax: money(250.0),
      discountTotal: money(250.0),
      total: money(4548.0),
      currency: 'INR',
      placedAt: new Date(),
      shippingAddressId: shippingAddress.id,
      billingAddressId: billingAddress.id,
      payments: {
        create: {
          provider: PaymentProvider.RAZORPAY,
          status: PaymentStatus.COMPLETED,
          amount: money(4548.0),
          currency: 'INR',
          processedAt: new Date(),
          transactionReference: 'pay_razor_123',
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      productId: amethyst.id,
      orderId: order.id,
      userId: user.id,
      rating: 5,
      title: 'Magical energy boost',
      body: 'Instant calm and clarity after meditating with this cluster.',
      isFeatured: true,
    },
  });

  await prisma.subscription.create({
    data: {
      userId: user.id,
      planCode: 'WELLNESS-ELITE',
      status: SubscriptionStatus.ACTIVE,
      startedAt: new Date(),
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const article = await prisma.article.create({
    data: {
      slug: 'crystal-cleansing-rituals',
      title: 'Crystal Cleansing Rituals for Beginners',
      excerpt: 'A three-step guide to reset the energy of your favourite crystals.',
      content:
        'Cleanse your crystals using moonlight, sage, and grounding meditation to maintain their vibrational clarity.',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: user.id,
    },
  });

  await prisma.media.create({
    data: {
      url: 'https://cdn.soulstone.shop/images/cleansing-guide.jpg',
      type: MediaType.IMAGE,
      altText: 'Crystals placed near incense for cleansing',
      articleId: article.id,
      sortOrder: 1,
    },
  });
}

async function main() {
  await resetDatabase();
  await createSeedData();
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
