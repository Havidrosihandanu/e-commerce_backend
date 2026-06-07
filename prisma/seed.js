/**
 * Prisma Seed Script
 * Menambahkan: 1 admin dan 1 customer contoh
 * Jalankan dengan: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─────────────────────────────────
  // USERS
  // ─────────────────────────────────
  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedUserPass  = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pcstore.com' },
    update: {},
    create: {
      name:     'Admin PC Store',
      email:    'admin@pcstore.com',
      password: hashedAdminPass,
      role:     'admin',
      no_telp:  '081234567890',
      alamat:   'Jakarta, Indonesia',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'budi@mail.com' },
    update: {},
    create: {
      name:     'Budi Santoso',
      email:    'budi@mail.com',
      password: hashedUserPass,
      role:     'customer',
      no_telp:  '089876543210',
      alamat:   'Surabaya, Indonesia',
    },
  });

  console.log(`✅ Users seeded: ${admin.email}, ${customer.email}`);

  console.log('');
  console.log('📋 Login credentials:');
  console.log('  Admin   → email: admin@pcstore.com  | password: admin123');
  console.log('  Customer→ email: budi@mail.com       | password: user123');
  console.log('');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });