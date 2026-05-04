/**
 * Prisma Seed Script
 * Menambahkan: 1 admin, 1 customer contoh, dan produk-produk PC Builder
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

  // ─────────────────────────────────
  // PRODUCTS — CPU
  // ─────────────────────────────────
  const cpu1 = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name:      'AMD Ryzen 5 5600X',
      price:     2450000,
      category:  'CPU',
      stock:     20,
      image_url: 'https://example.com/images/ryzen5-5600x.jpg',
      specs: {
        socket:           'AM4',
        cores:            6,
        threads:          12,
        base_clock:       '3.7GHz',
        boost_clock:      '4.6GHz',
        tdp:              65,
        supported_ram:    ['DDR4'],
        max_ram_speed:    3200,
      },
    },
  });

  const cpu2 = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name:      'Intel Core i5-12400F',
      price:     2300000,
      category:  'CPU',
      stock:     15,
      image_url: 'https://example.com/images/i5-12400f.jpg',
      specs: {
        socket:           'LGA1700',
        cores:            6,
        threads:          12,
        base_clock:       '2.5GHz',
        boost_clock:      '4.4GHz',
        tdp:              65,
        supported_ram:    ['DDR4', 'DDR5'],
        max_ram_speed:    4800,
      },
    },
  });

  // ─────────────────────────────────
  // PRODUCTS — Motherboard
  // ─────────────────────────────────
  const mb1 = await prisma.product.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name:      'ASUS ROG STRIX B550-F (AM4)',
      price:     1850000,
      category:  'Motherboard',
      stock:     10,
      image_url: 'https://example.com/images/asus-b550f.jpg',
      specs: {
        socket:      'AM4',
        form_factor: 'ATX',
        chipset:     'B550',
        ram_slots:   4,
        max_ram:     '128GB',
        ram_type:    'DDR4',
        max_ram_speed: 5100,
      },
    },
  });

  const mb2 = await prisma.product.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name:      'MSI MAG B660M MORTAR (LGA1700)',
      price:     1650000,
      category:  'Motherboard',
      stock:     8,
      image_url: 'https://example.com/images/msi-b660m.jpg',
      specs: {
        socket:      'LGA1700',
        form_factor: 'mATX',
        chipset:     'B660',
        ram_slots:   4,
        max_ram:     '128GB',
        ram_type:    'DDR4',
        max_ram_speed: 4800,
      },
    },
  });

  // ─────────────────────────────────
  // PRODUCTS — RAM
  // ─────────────────────────────────
  const ram1 = await prisma.product.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name:      'Corsair Vengeance LPX 16GB DDR4-3200',
      price:     650000,
      category:  'RAM',
      stock:     30,
      image_url: 'https://example.com/images/corsair-lpx16.jpg',
      specs: {
        capacity:  '16GB',
        type:      'DDR4',
        speed:     3200,
        kit:       '2x8GB',
        cas:       16,
      },
    },
  });

  const ram2 = await prisma.product.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name:      'G.Skill Ripjaws V 32GB DDR4-3600',
      price:     1100000,
      category:  'RAM',
      stock:     20,
      image_url: 'https://example.com/images/gskill-ripjaws32.jpg',
      specs: {
        capacity:  '32GB',
        type:      'DDR4',
        speed:     3600,
        kit:       '2x16GB',
        cas:       18,
      },
    },
  });

  // ─────────────────────────────────
  // PRODUCTS — Storage
  // ─────────────────────────────────
  const storage1 = await prisma.product.upsert({
    where: { id: 7 },
    update: {},
    create: {
      name:      'Samsung 970 EVO Plus 1TB NVMe SSD',
      price:     1200000,
      category:  'Storage',
      stock:     25,
      image_url: 'https://example.com/images/samsung-970evo.jpg',
      specs: {
        capacity:   '1TB',
        type:       'NVMe SSD',
        interface:  'M.2 PCIe 3.0',
        read_speed: '3500MB/s',
        write_speed:'3300MB/s',
        form_factor:'M.2 2280',
      },
    },
  });

  const storage2 = await prisma.product.upsert({
    where: { id: 8 },
    update: {},
    create: {
      name:      'Seagate Barracuda 2TB HDD',
      price:     650000,
      category:  'Storage',
      stock:     20,
      image_url: 'https://example.com/images/seagate-2tb.jpg',
      specs: {
        capacity:   '2TB',
        type:       'HDD',
        interface:  'SATA III',
        rpm:        7200,
        form_factor:'3.5"',
      },
    },
  });

  // ─────────────────────────────────
  // PRODUCTS — GPU
  // ─────────────────────────────────
  const gpu1 = await prisma.product.upsert({
    where: { id: 9 },
    update: {},
    create: {
      name:      'NVIDIA GeForce RTX 3060 12GB',
      price:     4200000,
      category:  'GPU',
      stock:     12,
      image_url: 'https://example.com/images/rtx3060.jpg',
      specs: {
        vram:         '12GB GDDR6',
        tdp:          170,
        pcie:         'PCIe 4.0 x16',
        length_mm:    242,
        power_req_w:  170,
      },
    },
  });

  const gpu2 = await prisma.product.upsert({
    where: { id: 10 },
    update: {},
    create: {
      name:      'AMD Radeon RX 6700 XT 12GB',
      price:     3900000,
      category:  'GPU',
      stock:     8,
      image_url: 'https://example.com/images/rx6700xt.jpg',
      specs: {
        vram:         '12GB GDDR6',
        tdp:          230,
        pcie:         'PCIe 4.0 x16',
        length_mm:    267,
        power_req_w:  230,
      },
    },
  });

  // ─────────────────────────────────
  // PRODUCTS — PSU
  // ─────────────────────────────────
  const psu1 = await prisma.product.upsert({
    where: { id: 11 },
    update: {},
    create: {
      name:      'Corsair RM750x 750W 80+ Gold',
      price:     1350000,
      category:  'PSU',
      stock:     18,
      image_url: 'https://example.com/images/corsair-rm750x.jpg',
      specs: {
        wattage:      750,
        efficiency:   '80+ Gold',
        modular:      'Fully Modular',
        form_factor:  'ATX',
      },
    },
  });

  const psu2 = await prisma.product.upsert({
    where: { id: 12 },
    update: {},
    create: {
      name:      'EVGA SuperNOVA 650W 80+ Gold',
      price:     950000,
      category:  'PSU',
      stock:     15,
      image_url: 'https://example.com/images/evga-650w.jpg',
      specs: {
        wattage:      650,
        efficiency:   '80+ Gold',
        modular:      'Fully Modular',
        form_factor:  'ATX',
      },
    },
  });

  // ─────────────────────────────────
  // PRODUCTS — Casing
  // ─────────────────────────────────
  await prisma.product.upsert({
    where: { id: 13 },
    update: {},
    create: {
      name:      'NZXT H510 Mid-Tower ATX',
      price:     850000,
      category:  'Casing',
      stock:     10,
      image_url: 'https://example.com/images/nzxt-h510.jpg',
      specs: {
        form_factor:         'ATX Mid-Tower',
        supported_mb:        ['ATX', 'mATX', 'Mini-ITX'],
        max_gpu_length_mm:   381,
        max_cpu_cooler_mm:   165,
      },
    },
  });

  await prisma.product.upsert({
    where: { id: 14 },
    update: {},
    create: {
      name:      'Fractal Design Meshify C mATX',
      price:     750000,
      category:  'Casing',
      stock:     8,
      image_url: 'https://example.com/images/fractal-meshify.jpg',
      specs: {
        form_factor:         'mATX Mid-Tower',
        supported_mb:        ['mATX', 'Mini-ITX'],
        max_gpu_length_mm:   315,
        max_cpu_cooler_mm:   172,
      },
    },
  });

  console.log('✅ Products seeded (CPU, Motherboard, RAM, Storage, GPU, PSU, Casing)');
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
