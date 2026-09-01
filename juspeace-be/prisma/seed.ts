import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

const DEFAULT_SEED_PASSWORD = 'Test!1234';

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
