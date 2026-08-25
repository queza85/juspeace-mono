import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
