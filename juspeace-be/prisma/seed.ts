import {
  ContentSection,
  PaymentProviderKind,
  PrismaClient,
  ProductStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

const DEFAULT_SEED_PASSWORD = 'Test!1234';

const COLLECTION_PRODUCTS = [
  {
    slug: 'black-strong-commitment',
    name: 'Strong Commitment',
    description: 'A symbol of unwavering belief and strength.',
    stock: 20,
    imageUrl: '/marque/juespeace_mar4.png',
  },
  {
    slug: 'white-pure-hope',
    name: 'Pure Hope',
    description: 'A reflection of clarity, sincerity, and new beginnings.',
    stock: 15,
    imageUrl: '/marque/juspeace_mr3.png',
  },
  {
    slug: 'stripe-harmony-peace',
    name: 'Harmony & Peace',
    description: 'Where differences meet in balance and unity.',
    stock: 18,
    imageUrl: '/marque/ju_mar6.png',
  },
] as const;

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@lomtech.net').toLowerCase();
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_SEED_PASSWORD;
  const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      name: 'Admin',
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      name: 'Admin',
      isActive: true,
    },
  });

  for (const product of COLLECTION_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        stock: product.stock,
        status: ProductStatus.ACTIVE,
        imageUrl: product.imageUrl,
        priceCents: 150_00,
        currency: 'USD',
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        stock: product.stock,
        status: ProductStatus.ACTIVE,
        imageUrl: product.imageUrl,
        priceCents: 150_00,
        currency: 'USD',
      },
    });
  }

  await seedStorefrontAdmin();
}

async function seedStorefrontAdmin() {
  const settings: Array<{ key: string; value: string }> = [
    { key: 'storeName', value: 'Juspeace' },
    { key: 'logoUrl', value: '/header/juspeace_header.png' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  const shipping = [
    {
      code: 'standard',
      name: 'Standard',
      description: 'Default delivery fee. Adjust before connecting checkout.',
      priceCents: 500,
      sortOrder: 0,
    },
    {
      code: 'pickup',
      name: 'Pickup',
      description: 'Customer pickup.',
      priceCents: 0,
      sortOrder: 1,
    },
  ];

  for (const method of shipping) {
    await prisma.shippingMethod.upsert({
      where: { code: method.code },
      update: {},
      create: { ...method, currency: 'USD', enabled: true },
    });
  }

  const payments = [
    { code: 'CARD', name: 'Card', sortOrder: 0 },
    { code: 'APPLE_PAY', name: 'Apple Pay', sortOrder: 1 },
    { code: 'GOOGLE_PAY', name: 'Google Pay', sortOrder: 2 },
    { code: 'PAYPAL', name: 'PayPal', sortOrder: 3 },
  ];

  for (const method of payments) {
    await prisma.paymentMethodConfig.upsert({
      where: { code: method.code },
      update: {},
      create: {
        ...method,
        enabled: true,
        provider: PaymentProviderKind.DUMMY,
        instructions:
          'Dummy method. No charge is sent until a payment gateway is connected.',
      },
    });
  }

  const hero = await prisma.contentBlock.findFirst({
    where: { section: ContentSection.HERO, locale: 'en', title: 'Juspeace' },
  });
  if (!hero) {
    await prisma.contentBlock.create({
      data: {
        section: ContentSection.HERO,
        locale: 'en',
        title: 'Juspeace',
        subtitle: 'Replace this block with the live hero copy.',
        imageUrl: '/landing/landing-page-hand-background.png',
        sortOrder: 0,
        published: true,
      },
    });
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: COLLECTION_PRODUCTS.map((product) => product.slug) } },
    orderBy: { slug: 'asc' },
  });

  for (const [index, product] of products.entries()) {
    await prisma.featuredProduct.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        sortOrder: index,
        cardImageUrl: product.imageUrl,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
