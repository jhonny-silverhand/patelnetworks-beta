import { PrismaClient, UserRole, MovementReason } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CCTV & Security Hardware Catalog Seeding...');

  // 1. Clean existing records (in dependency order)
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.sku.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 2. Create Super Admin User
  const adminUser = await prisma.user.create({
    data: {
      phone: '+919876543210',
      email: 'admin@patelnetworks.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashforadminpassword', // Placeholder hash
      role: UserRole.SUPER_ADMIN,
      adminProfile: {
        create: {
          fullName: 'Patel Networks Admin',
        },
      },
    },
  });
  console.log(`👤 Created Super Admin: ${adminUser.email}`);

  // 3. Create Brands
  const brandData = [
    { name: 'CP Plus', slug: 'cp-plus', description: 'Leading Indian surveillance and security systems brand' },
    { name: 'Hikvision', slug: 'hikvision', description: 'World leader in enterprise security and AcuSense AI cameras' },
    { name: 'Dahua', slug: 'dahua', description: 'Advanced video surveillance and Full-color imaging solutions' },
    { name: 'MTC', slug: 'mtc', description: 'High-grade analog HD cameras and connectors' },
    { name: 'D-Link', slug: 'd-link', description: 'Industry standard networking, Cat6 cables, and Gigabit switches' },
    { name: 'DGSoal', slug: 'dgsoal', description: 'Durable networking cables and connectors' },
    { name: 'Axpial', slug: 'axpial', description: 'Precision CCTV hardware accessories and BNC joints' },
    { name: 'Optilink', slug: 'optilink', description: 'Optical fiber media converters and transceivers' },
    { name: 'Lapcare', slug: 'lapcare', description: 'Reliable commercial surveillance screens and peripherals' },
    { name: 'AOC', slug: 'aoc', description: 'High-definition 24/7 security monitoring displays' },
  ];

  const brands: Record<string, string> = {};
  for (const b of brandData) {
    const created = await prisma.brand.create({ data: b });
    brands[b.slug] = created.id;
  }
  console.log(`🏷️  Created ${brandData.length} Brands.`);

  // 4. Create Categories & Subcategories
  const catCCTV = await prisma.category.create({
    data: {
      name: 'CCTV & Surveillance',
      slug: 'cctv-surveillance',
      description: 'HD Analog, Network IP Cameras, and Digital Video Recorders',
      hsnCode: '8525',
      gstRate: 18.0,
    },
  });

  const subHdCam = await prisma.category.create({
    data: {
      name: 'HD Analog Cameras',
      slug: 'hd-analog-cameras',
      parentId: catCCTV.id,
      hsnCode: '8525',
      gstRate: 18.0,
    },
  });

  const subIpCam = await prisma.category.create({
    data: {
      name: 'Network (IP) Cameras',
      slug: 'network-ip-cameras',
      parentId: catCCTV.id,
      hsnCode: '8525',
      gstRate: 18.0,
    },
  });

  const subDvrNvr = await prisma.category.create({
    data: {
      name: 'Recorders (DVR & NVR)',
      slug: 'recorders-dvr-nvr',
      parentId: catCCTV.id,
      hsnCode: '8525',
      gstRate: 18.0,
    },
  });

  const catCables = await prisma.category.create({
    data: {
      name: 'Cables & Wiring',
      slug: 'cables-wiring',
      description: 'Coaxial CCTV cables and Cat6 structured networking cables',
      hsnCode: '8544',
      gstRate: 18.0,
    },
  });

  const catStorage = await prisma.category.create({
    data: {
      name: 'Surveillance Storage',
      slug: 'surveillance-storage',
      description: '24/7 Surveillance Grade Internal Hard Drives',
      hsnCode: '8471',
      gstRate: 18.0,
    },
  });

  const catAccessories = await prisma.category.create({
    data: {
      name: 'Power & Accessories',
      slug: 'power-accessories',
      description: 'SMPS Power Supplies, BNC Connectors, and Splitters',
      hsnCode: '8536',
      gstRate: 18.0,
    },
  });

  console.log('📁 Created Categories & Subcategories.');

  // 5. Create Core Products with Multi-Attribute Variants & SKUs

  // Product 1: CP Plus Smart IR Bullet Camera
  const prodCpPlus = await prisma.product.create({
    data: {
      name: 'CP Plus Cosmic Series Smart IR Bullet Camera',
      slug: 'cp-plus-cosmic-series-smart-ir-bullet-camera',
      brandId: brands['cp-plus'],
      categoryId: subHdCam.id,
      modelNumber: 'CP-VAC-T24L2',
      isFeatured: true,
      isCodAllowed: true,
      shortDesc: 'Weatherproof IP67 outdoor analog HD bullet camera with high-performance IR LEDs.',
      description:
        'The CP Plus Cosmic Series delivers crystal clear surveillance video over standard coaxial cabling. Designed with IP67 weatherproof housing and smart IR for pristine nighttime visibility.',
      specifications: {
        lens: '3.6mm Fixed Lens (85° FOV)',
        irRange: '20 Meters Smart IR',
        weatherproof: 'IP67 Rated',
        videoOutput: '1-Channel BNC HD Video Output (AHD/TVI/CVI/CVBS)',
        power: '12V DC ± 10%',
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80', altText: 'CP Plus Camera Front' },
        ],
      },
    },
  });

  // Variants for Product 1 (2MP, 4MP, 8MP, 16MP)
  const cpPlusVariants = [
    { name: '2MP Resolution (1080p)', code: 'CPP-001-2MP', mrp: 2800, price: 1450, stock: 25, resolution: '2MP' },
    { name: '4MP Resolution (2K Quad-HD)', code: 'CPP-001-4MP', mrp: 4200, price: 2350, stock: 15, resolution: '4MP' },
    { name: '8MP Resolution (4K Ultra-HD)', code: 'CPP-001-8MP', mrp: 8500, price: 4890, stock: 8, resolution: '8MP' },
    { name: '16MP Resolution (Ultra Extreme)', code: 'CPP-001-16MP', mrp: 16000, price: 9400, stock: 3, resolution: '16MP' },
  ];

  for (const v of cpPlusVariants) {
    const sku = await prisma.sku.create({
      data: {
        code: v.code,
        barcode: `890${v.code.replace(/[^0-9]/g, '').padEnd(9, '0')}`,
        mrp: v.mrp,
        sellingPrice: v.price,
        weightGrams: 450,
        dimensionsCm: { length: 16, width: 8, height: 8 },
        inventory: {
          create: {
            currentStock: v.stock,
            reservedStock: 0,
            lowStockThreshold: 5,
          },
        },
        movements: {
          create: {
            quantity: v.stock,
            reason: MovementReason.PURCHASE_RECEIPT,
            notes: 'Initial warehouse intake seed',
          },
        },
      },
    });

    await prisma.productVariant.create({
      data: {
        productId: prodCpPlus.id,
        skuId: sku.id,
        name: v.name,
        attributes: { resolution: v.resolution, lens: '3.6mm', housing: 'Bullet', nightVision: 'Smart IR' },
      },
    });
  }

  // Product 2: Hikvision AcuSense DVR
  const prodHikDvr = await prisma.product.create({
    data: {
      name: 'Hikvision AcuSense 1080p AI Digital Video Recorder',
      slug: 'hikvision-acusense-1080p-ai-dvr',
      brandId: brands['hikvision'],
      categoryId: subDvrNvr.id,
      modelNumber: 'iDS-7200HQHI-M1/S',
      isFeatured: true,
      isCodAllowed: true,
      shortDesc: 'Deep-learning based motion detection 2.0 and human/vehicle classification DVR.',
      description:
        'Hikvision AcuSense DVR utilizes advanced deep learning algorithms to distinguish persons and vehicles from other moving targets, reducing false alarms by up to 90%. Supports H.265 Pro+ compression.',
      specifications: {
        compression: 'H.265 Pro+ / H.265 / H.264+',
        audioInput: '1-ch RCA & Audio via Coaxial Cable',
        storageCapacity: 'Up to 10TB per SATA port',
        hdmiOutput: '1-ch 1920x1080/60Hz',
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', altText: 'Hikvision DVR Unit' },
        ],
      },
    },
  });

  const hikDvrVariants = [
    { name: '4-Channel DVR', code: 'HIK-DVR-04CH', mrp: 5500, price: 3200, stock: 20, channels: 4 },
    { name: '8-Channel DVR', code: 'HIK-DVR-08CH', mrp: 9000, price: 5400, stock: 12, channels: 8 },
  ];

  for (const v of hikDvrVariants) {
    const sku = await prisma.sku.create({
      data: {
        code: v.code,
        barcode: `890${v.code.replace(/[^0-9]/g, '').padEnd(9, '0')}`,
        mrp: v.mrp,
        sellingPrice: v.price,
        weightGrams: 1200,
        dimensionsCm: { length: 26, width: 22, height: 5 },
        inventory: {
          create: {
            currentStock: v.stock,
            reservedStock: 0,
            lowStockThreshold: 3,
          },
        },
        movements: {
          create: {
            quantity: v.stock,
            reason: MovementReason.PURCHASE_RECEIPT,
            notes: 'Initial warehouse intake seed',
          },
        },
      },
    });

    await prisma.productVariant.create({
      data: {
        productId: prodHikDvr.id,
        skuId: sku.id,
        name: v.name,
        attributes: { channels: v.channels, resolutionSupport: 'Up to 4MP', audioSupport: true },
      },
    });
  }

  // Product 3: Seagate SkyHawk Surveillance HDD
  const prodHdd = await prisma.product.create({
    data: {
      name: 'Seagate SkyHawk 3.5-inch Surveillance Internal Hard Drive',
      slug: 'seagate-skyhawk-surveillance-internal-hard-drive',
      brandId: brands['cp-plus'], // or generic
      categoryId: catStorage.id,
      modelNumber: 'ST1000VX005',
      isFeatured: true,
      isCodAllowed: true,
      shortDesc: 'Optimized for DVRs and NVRs, SkyHawk surveillance drives are tuned for 24×7 workloads.',
      description:
        'ImagePerfect firmware helps to minimize dropped frames and downtime with a workload rating 3× that of desktop drives, supporting up to 64 HD cameras simultaneously.',
      specifications: {
        interface: 'SATA 6Gb/s',
        rpm: '5900 RPM',
        cache: '64MB Buffer',
        workloadRate: '180TB/year',
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80', altText: 'Surveillance Hard Drive' },
        ],
      },
    },
  });

  const hddVariants = [
    { name: '1TB Capacity', code: 'ST-SKY-1TB', mrp: 5200, price: 3600, stock: 30, size: '1TB' },
    { name: '2TB Capacity', code: 'ST-SKY-2TB', mrp: 7400, price: 5100, stock: 25, size: '2TB' },
    { name: '4TB Capacity', code: 'ST-SKY-4TB', mrp: 11800, price: 8200, stock: 15, size: '4TB' },
  ];

  for (const v of hddVariants) {
    const sku = await prisma.sku.create({
      data: {
        code: v.code,
        barcode: `890${v.code.replace(/[^0-9]/g, '').padEnd(9, '0')}`,
        mrp: v.mrp,
        sellingPrice: v.price,
        weightGrams: 650,
        dimensionsCm: { length: 15, width: 10, height: 3 },
        inventory: {
          create: {
            currentStock: v.stock,
            reservedStock: 0,
            lowStockThreshold: 5,
          },
        },
      },
    });

    await prisma.productVariant.create({
      data: {
        productId: prodHdd.id,
        skuId: sku.id,
        name: v.name,
        attributes: { capacity: v.size, formFactor: '3.5-inch' },
      },
    });
  }

  // Product 4: D-Link Cat6 Cable Drum (Bulky item, Prepaid Only)
  const prodCable = await prisma.product.create({
    data: {
      name: 'D-Link Cat6 Solid UTP Structured Networking Cable (305m Roll)',
      slug: 'd-link-cat6-solid-utp-305m-roll',
      brandId: brands['d-link'],
      categoryId: catCables.id,
      modelNumber: 'NCB-C6UGRYR-305',
      isFeatured: false,
      isCodAllowed: false, // Heavy & bulky drum (ADR-004)
      shortDesc: 'Pure copper 23 AWG 4-pair unshielded twisted pair (UTP) 305m drum for gigabit CCTV networks.',
      description:
        'D-Link Cat6 solid copper cable is certified for high-bandwidth IP CCTV surveillance networks, gigabit ethernet distribution, and long-range PoE transmission without signal degradation.',
      specifications: {
        conductor: '23 AWG Solid Bare Copper',
        jacket: 'Flame Retardant PVC (CM rated)',
        bandwidth: 'Up to 250 MHz',
        length: '305 Meters (1000 ft)',
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80', altText: 'Cat6 Cable Box' },
        ],
      },
    },
  });

  const cableSku = await prisma.sku.create({
    data: {
      code: 'DL-CAT6-305M',
      barcode: '8901234567890',
      mrp: 10500,
      sellingPrice: 7800,
      weightGrams: 12500, // 12.5 kg
      dimensionsCm: { length: 38, width: 38, height: 26 },
      inventory: {
        create: {
          currentStock: 10,
          reservedStock: 0,
          lowStockThreshold: 2,
        },
      },
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: prodCable.id,
      skuId: cableSku.id,
      name: '305m Box (Grey)',
      attributes: { length: '305 Meters', standard: 'Cat6 UTP', conductor: '100% Pure Solid Copper' },
    },
  });

  console.log('📦 Created Products, Variants, SKUs and SKU-level Inventories.');
  console.log('✅ Catalog Seed Complete! The store is pre-populated with realistic surveillance equipment.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
