import { PrismaClient, ProductStatus, SellerType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

const DEFAULT_SEED_PASSWORD = 'Test!1234';

async function upsertUser(input: {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const email = input.email.toLowerCase();

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: input.role,
      name: input.name,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: input.role,
      name: input.name,
      isActive: true,
    },
  });
}

async function seedUsers() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@lomtech.net';
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_SEED_PASSWORD;
  const userEmail = process.env.SEED_USER_EMAIL ?? 'user@lomtech.net';
  const userPassword = process.env.SEED_USER_PASSWORD ?? DEFAULT_SEED_PASSWORD;

  await upsertUser({
    email: adminEmail,
    password: adminPassword,
    role: UserRole.ADMIN,
    name: 'Admin',
  });

  await upsertUser({
    email: userEmail,
    password: userPassword,
    role: UserRole.USER,
    name: 'Demo User',
  });

  const distributorEmail =
    process.env.SEED_DISTRIBUTOR_EMAIL ?? 'distributor@lomtech.net';
  const distributorPassword =
    process.env.SEED_DISTRIBUTOR_PASSWORD ?? DEFAULT_SEED_PASSWORD;

  await upsertUser({
    email: distributorEmail,
    password: distributorPassword,
    role: UserRole.DISTRIBUTOR,
    name: 'Mexico Distributor',
  });
}

async function seedRegistry() {
  const market = await prisma.market.upsert({
    where: { code: 'MX' },
    update: { name: 'Mexico', currency: 'USD' },
    create: { code: 'MX', name: 'Mexico', currency: 'USD' },
  });

  const distributorUser = await prisma.user.findUnique({
    where: {
      email: (process.env.SEED_DISTRIBUTOR_EMAIL ?? 'distributor@lomtech.net').toLowerCase(),
    },
  });

  const onlineSeller = await prisma.authorizedSeller.upsert({
    where: { id: 'seed-online-seller-mx' },
    update: {
      marketId: market.id,
      name: 'JUSPEACE Official Online Store',
      type: SellerType.OFFICIAL_ONLINE,
      locationLabel: 'Online',
      isActive: true,
    },
    create: {
      id: 'seed-online-seller-mx',
      marketId: market.id,
      name: 'JUSPEACE Official Online Store',
      type: SellerType.OFFICIAL_ONLINE,
      locationLabel: 'Online',
      isActive: true,
    },
  });

  const retailSeller = await prisma.authorizedSeller.upsert({
    where: { id: 'seed-retail-seller-mx' },
    update: {
      marketId: market.id,
      name: 'JUSPEACE Mexico',
      type: SellerType.RETAIL,
      locationLabel: 'Mexico City Store',
      isActive: true,
      userId: distributorUser?.id,
    },
    create: {
      id: 'seed-retail-seller-mx',
      marketId: market.id,
      name: 'JUSPEACE Mexico',
      type: SellerType.RETAIL,
      locationLabel: 'Mexico City Store',
      isActive: true,
      userId: distributorUser?.id,
    },
  });

  const bracelet = await prisma.product.upsert({
    where: { slug: 'juspeace-bracelet-black' },
    update: {
      name: 'JUSPEACE Bracelet — Black',
      description: 'Official JUSPEACE bracelet for registry preparation seed data.',
      priceCents: 5000,
      stock: 1000,
      status: ProductStatus.ACTIVE,
    },
    create: {
      slug: 'juspeace-bracelet-black',
      name: 'JUSPEACE Bracelet — Black',
      description: 'Official JUSPEACE bracelet for registry preparation seed data.',
      priceCents: 5000,
      currency: 'USD',
      stock: 1000,
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.inventoryAllocation.upsert({
    where: {
      authorizedSellerId_productId: {
        authorizedSellerId: retailSeller.id,
        productId: bracelet.id,
      },
    },
    update: { allocatedQuantity: 10000, marketId: market.id },
    create: {
      marketId: market.id,
      authorizedSellerId: retailSeller.id,
      productId: bracelet.id,
      allocatedQuantity: 10000,
    },
  });

  return { market, onlineSeller, retailSeller, bracelet };
}

async function main() {
  await seedUsers();
  await seedRegistry();

  const essentials = await prisma.category.upsert({
    where: { slug: 'essentials' },
    update: {},
    create: {
      slug: 'essentials',
      name: 'Essentials',
      description: 'Everyday items for mindful living',
    },
  });

  const products = [
    {
      slug: 'organic-cotton-tote',
      name: 'Organic Cotton Tote',
      description: 'Reusable tote bag made from GOTS-certified organic cotton.',
      priceCents: 2499,
      stock: 120,
      status: ProductStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      categoryId: essentials.id,
    },
    {
      slug: 'bamboo-water-bottle',
      name: 'Bamboo Water Bottle',
      description: 'Insulated bottle with a sustainable bamboo exterior.',
      priceCents: 3299,
      stock: 85,
      status: ProductStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
      categoryId: essentials.id,
    },
    {
      slug: 'hand-poured-soy-candle',
      name: 'Hand-Poured Soy Candle',
      description: 'Small-batch soy candle with cedar and lavender notes.',
      priceCents: 1899,
      stock: 200,
      status: ProductStatus.ACTIVE,
      imageUrl: 'https://images.unsplash.com/photo-1602607890770-0a0a0a0a0a0a?w=800',
      categoryId: essentials.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
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
