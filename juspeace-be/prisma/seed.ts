import { PrismaClient, ProductStatus, UserRole } from '@prisma/client';
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
