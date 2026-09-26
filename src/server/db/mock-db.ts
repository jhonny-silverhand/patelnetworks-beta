/* eslint-disable @typescript-eslint/no-explicit-any */
// In-Memory Database and Prisma Mock for AI Studio runtime environment
// Enables complete functionality of Patel Networks Surveillance Storefront & Admin Command Center

import { OrderStatus, PaymentStatus, MovementReason, UserRole } from '@prisma/client';

export class Decimal {
  private val: number;
  constructor(v: number | string | Decimal) {
    if (v instanceof Decimal) {
      this.val = v.val;
    } else {
      this.val = Number(v) || 0;
    }
  }
  toString() {
    return this.val.toFixed(2);
  }
  toFixed(n = 2) {
    return this.val.toFixed(n);
  }
  toNumber() {
    return this.val;
  }
  valueOf() {
    return this.val;
  }
  [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') return this.toString();
    return this.val;
  }
}

// Global in-memory data store preserved across HMR and requests
class MockDataStore {
  users: any[] = [];
  adminProfiles: any[] = [];
  customers: any[] = [];
  customerAddresses: any[] = [];
  brands: any[] = [];
  categories: any[] = [];
  products: any[] = [];
  productImages: any[] = [];
  productVariants: any[] = [];
  skus: any[] = [];
  inventories: any[] = [];
  inventoryMovements: any[] = [];
  carts: any[] = [];
  cartItems: any[] = [];
  orders: any[] = [];
  orderItems: any[] = [];
  shippingAddresses: any[] = [];
  shipments: any[] = [];
  shipmentEvents: any[] = [];
  payments: any[] = [];
  otpVerifications: any[] = [];
  b2bQuoteInquiries: any[] = [];
  auditLogs: any[] = [];
  orderStatusHistories: any[] = [];
  paymentEvents: any[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Super Admin User
    this.users.push({
      id: 'admin-root-superadmin',
      phone: '+919876543210',
      email: 'superadmin@patelnetworks.in',
      passwordHash: 'patel@admin2026',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    this.adminProfiles.push({
      id: 'profile-superadmin',
      userId: 'admin-root-superadmin',
      fullName: 'Patel Networks Admin Lead',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    // 2. Demo Customer (B2B Contractor)
    const demoCustUser = {
      id: 'user-contractor-1',
      phone: '+919876543210',
      email: 'contractor@patelnetworks.in',
      passwordHash: null,
      role: UserRole.CUSTOMER,
      isActive: true,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    };
    this.users.push(demoCustUser);

    const demoCust = {
      id: 'cust-contractor-1',
      userId: demoCustUser.id,
      fullName: 'Rajesh Patel',
      companyName: 'Patel Security Solutions',
      gstin: '24AABCP1234F1Z9',
      isB2BVerified: true,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    };
    this.customers.push(demoCust);

    this.customerAddresses.push({
      id: 'addr-contractor-1',
      customerId: demoCust.id,
      recipientName: 'Rajesh Patel',
      phone: '9876543210',
      addressLine1: 'Shop 12, Ring Road Electronics Hub',
      addressLine2: 'Near Central Plaza',
      landmark: 'Opposite State Bank',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395003',
      isDefault: true,
      type: 'COMMERCIAL',
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    });

    // 3. Brands
    const brandDefs = [
      { id: 'brand-cp-plus', name: 'CP Plus', slug: 'cp-plus', description: 'Leading Indian surveillance and security systems brand' },
      { id: 'brand-hikvision', name: 'Hikvision', slug: 'hikvision', description: 'World leader in enterprise security and AcuSense AI cameras' },
      { id: 'brand-dahua', name: 'Dahua', slug: 'dahua', description: 'Advanced video surveillance and Full-color imaging solutions' },
      { id: 'brand-mtc', name: 'MTC', slug: 'mtc', description: 'High-grade analog HD cameras and connectors' },
      { id: 'brand-d-link', name: 'D-Link', slug: 'd-link', description: 'Industry standard networking, Cat6 cables, and Gigabit switches' },
      { id: 'brand-dgsoal', name: 'DGSoal', slug: 'dgsoal', description: 'Durable networking cables and connectors' },
      { id: 'brand-axpial', name: 'Axpial', slug: 'axpial', description: 'Precision CCTV hardware accessories and BNC joints' },
      { id: 'brand-optilink', name: 'Optilink', slug: 'optilink', description: 'Optical fiber media converters and transceivers' },
      { id: 'brand-lapcare', name: 'Lapcare', slug: 'lapcare', description: 'Reliable commercial surveillance screens and peripherals' },
      { id: 'brand-aoc', name: 'AOC', slug: 'aoc', description: 'High-definition 24/7 security monitoring displays' },
    ];
    for (const b of brandDefs) {
      this.brands.push({ ...b, isActive: true, logoUrl: null, createdAt: new Date(), updatedAt: new Date() });
    }

    // 4. Categories & Subcategories
    const catDefs = [
      { id: 'cat-cctv', name: 'CCTV & Surveillance', slug: 'cctv-surveillance', description: 'HD Analog, Network IP Cameras, and Digital Video Recorders', hsnCode: '8525', gstRate: 18.0, parentId: null },
      { id: 'sub-hd-cam', name: 'HD Analog Cameras', slug: 'hd-analog-cameras', description: '2MP to 16MP Bullet & Dome Analog Cameras', hsnCode: '8525', gstRate: 18.0, parentId: 'cat-cctv' },
      { id: 'sub-ip-cam', name: 'Network (IP) Cameras', slug: 'network-ip-cameras', description: 'PoE AI Smart Surveillance Cameras', hsnCode: '8525', gstRate: 18.0, parentId: 'cat-cctv' },
      { id: 'sub-dvr-nvr', name: 'Recorders (DVR & NVR)', slug: 'recorders-dvr-nvr', description: '4, 8 & 16 Channels with AI detection', hsnCode: '8525', gstRate: 18.0, parentId: 'cat-cctv' },
      { id: 'cat-cables', name: 'Cables & Wiring', slug: 'cables-wiring', description: 'Coaxial CCTV cables and Cat6 structured networking cables', hsnCode: '8544', gstRate: 18.0, parentId: null },
      { id: 'cat-storage', name: 'Surveillance Storage', slug: 'surveillance-storage', description: '24/7 Surveillance Grade Internal Hard Drives', hsnCode: '8471', gstRate: 18.0, parentId: null },
      { id: 'cat-accessories', name: 'Power & Accessories', slug: 'power-accessories', description: 'SMPS Power Supplies, BNC Connectors, and Splitters', hsnCode: '8536', gstRate: 18.0, parentId: null },
    ];
    for (const c of catDefs) {
      this.categories.push({ ...c, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    }

    // Helper to add product + variants + skus + inventory
    const addProduct = (
      p: any,
      variants: Array<{ name: string; code: string; mrp: number; price: number; stock: number; attributes?: any }>,
      images: string[]
    ) => {
      const prodId = p.id || `prod-${p.slug}`;
      const prodRecord = {
        ...p,
        id: prodId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.products.push(prodRecord);

      images.forEach((url, idx) => {
        this.productImages.push({
          id: `img-${prodId}-${idx}`,
          productId: prodId,
          url,
          altText: p.name,
          sortOrder: idx,
          createdAt: new Date(),
        });
      });

      variants.forEach((v, idx) => {
        const skuId = `sku-${v.code}`;
        const skuRecord = {
          id: skuId,
          code: v.code,
          barcode: `890${v.code.replace(/[^0-9]/g, '').padEnd(9, '0')}`,
          mrp: new Decimal(v.mrp),
          sellingPrice: new Decimal(v.price),
          weightGrams: 500,
          dimensionsCm: { length: 15, width: 10, height: 8 },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.skus.push(skuRecord);

        const invRecord = {
          id: `inv-${skuId}`,
          skuId,
          currentStock: v.stock,
          reservedStock: 0,
          lowStockThreshold: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.inventories.push(invRecord);

        this.inventoryMovements.push({
          id: `mov-${skuId}-init`,
          skuId,
          quantity: v.stock,
          reason: MovementReason.PURCHASE_RECEIPT,
          notes: 'Initial warehouse intake seed',
          createdAt: new Date(),
        });

        const varId = `var-${prodId}-${idx}`;
        this.productVariants.push({
          id: varId,
          productId: prodId,
          skuId,
          name: v.name,
          attributes: v.attributes || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    };

    // Product 1: CP Plus Bullet Camera
    addProduct(
      {
        id: 'prod-cpp-cosmic-bullet',
        name: 'CP Plus Cosmic Series Smart IR Bullet Camera',
        slug: 'cp-plus-cosmic-series-smart-ir-bullet-camera',
        brandId: 'brand-cp-plus',
        categoryId: 'sub-hd-cam',
        modelNumber: 'CP-VAC-T24L2',
        isFeatured: true,
        isCodAllowed: true,
        shortDesc: 'Weatherproof IP67 outdoor analog HD bullet camera with high-performance IR LEDs.',
        description: 'The CP Plus Cosmic Series delivers crystal clear surveillance video over standard coaxial cabling. Designed with IP67 weatherproof housing and smart IR for pristine nighttime visibility.',
        specifications: {
          lens: '3.6mm Fixed Lens (85° FOV)',
          irRange: '20 Meters Smart IR',
          weatherproof: 'IP67 Rated',
          videoOutput: '1-Channel BNC HD Video Output (AHD/TVI/CVI/CVBS)',
          power: '12V DC ± 10%',
        },
      },
      [
        { name: '2MP Resolution (1080p)', code: 'CPP-001-2MP', mrp: 2800, price: 1450, stock: 25, attributes: { resolution: '2MP', lens: '3.6mm', housing: 'Bullet' } },
        { name: '4MP Resolution (2K Quad-HD)', code: 'CPP-001-4MP', mrp: 4200, price: 2350, stock: 15, attributes: { resolution: '4MP', lens: '3.6mm', housing: 'Bullet' } },
        { name: '8MP Resolution (4K Ultra-HD)', code: 'CPP-001-8MP', mrp: 8500, price: 4890, stock: 8, attributes: { resolution: '8MP', lens: '3.6mm', housing: 'Bullet' } },
        { name: '16MP Resolution (Ultra Extreme)', code: 'CPP-001-16MP', mrp: 16000, price: 9400, stock: 3, attributes: { resolution: '16MP', lens: '3.6mm', housing: 'Bullet' } },
      ],
      ['https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80']
    );

    // Product 2: Hikvision AcuSense DVR
    addProduct(
      {
        id: 'prod-hik-acusense-dvr',
        name: 'Hikvision AcuSense 1080p AI Digital Video Recorder',
        slug: 'hikvision-acusense-1080p-ai-dvr',
        brandId: 'brand-hikvision',
        categoryId: 'sub-dvr-nvr',
        modelNumber: 'iDS-7200HQHI-M1/S',
        isFeatured: true,
        isCodAllowed: true,
        shortDesc: 'Deep-learning based motion detection 2.0 and human/vehicle classification DVR.',
        description: 'Hikvision AcuSense DVR utilizes advanced deep learning algorithms to distinguish persons and vehicles from other moving targets, reducing false alarms by up to 90%. Supports H.265 Pro+ compression.',
        specifications: {
          compression: 'H.265 Pro+ / H.265 / H.264+',
          audioInput: '1-ch RCA & Audio via Coaxial Cable',
          storageCapacity: 'Up to 10TB per SATA port',
          hdmiOutput: '1-ch 1920x1080/60Hz',
        },
      },
      [
        { name: '4-Channel DVR', code: 'HIK-DVR-04CH', mrp: 5500, price: 3200, stock: 20, attributes: { channels: 4, resolutionSupport: 'Up to 4MP' } },
        { name: '8-Channel DVR', code: 'HIK-DVR-08CH', mrp: 9000, price: 5400, stock: 12, attributes: { channels: 8, resolutionSupport: 'Up to 4MP' } },
      ],
      ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80']
    );

    // Product 3: Seagate SkyHawk Surveillance HDD
    addProduct(
      {
        id: 'prod-seagate-skyhawk-hdd',
        name: 'Seagate SkyHawk 3.5-inch Surveillance Internal Hard Drive',
        slug: 'seagate-skyhawk-surveillance-internal-hard-drive',
        brandId: 'brand-cp-plus',
        categoryId: 'cat-storage',
        modelNumber: 'ST1000VX005',
        isFeatured: true,
        isCodAllowed: true,
        shortDesc: 'Optimized for DVRs and NVRs, SkyHawk surveillance drives are tuned for 24×7 workloads.',
        description: 'ImagePerfect firmware helps to minimize dropped frames and downtime with a workload rating 3× that of desktop drives, supporting up to 64 HD cameras simultaneously.',
        specifications: {
          interface: 'SATA 6Gb/s',
          rpm: '5900 RPM',
          cache: '64MB Buffer',
          workloadRate: '180TB/year',
        },
      },
      [
        { name: '1TB Capacity', code: 'ST-SKY-1TB', mrp: 5200, price: 3600, stock: 30, attributes: { capacity: '1TB', formFactor: '3.5-inch' } },
        { name: '2TB Capacity', code: 'ST-SKY-2TB', mrp: 7400, price: 5100, stock: 25, attributes: { capacity: '2TB', formFactor: '3.5-inch' } },
        { name: '4TB Capacity', code: 'ST-SKY-4TB', mrp: 11800, price: 8200, stock: 15, attributes: { capacity: '4TB', formFactor: '3.5-inch' } },
      ],
      ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80']
    );

    // Product 4: D-Link Cat6 Cable Drum
    addProduct(
      {
        id: 'prod-dlink-cat6-cable',
        name: 'D-Link Cat6 Solid UTP Structured Networking Cable (305m Roll)',
        slug: 'd-link-cat6-solid-utp-305m-roll',
        brandId: 'brand-d-link',
        categoryId: 'cat-cables',
        modelNumber: 'NCB-C6UGRYR-305',
        isFeatured: false,
        isCodAllowed: false,
        shortDesc: 'Pure copper 23 AWG 4-pair unshielded twisted pair (UTP) 305m drum for gigabit CCTV networks.',
        description: 'D-Link Cat6 solid copper cable is certified for high-bandwidth IP CCTV surveillance networks, gigabit ethernet distribution, and long-range PoE transmission without signal degradation.',
        specifications: {
          conductor: '23 AWG Solid Bare Copper',
          jacket: 'Flame Retardant PVC (CM rated)',
          bandwidth: 'Up to 250 MHz',
          length: '305 Meters (1000 ft)',
        },
      },
      [
        { name: '305m Box (Grey)', code: 'DL-CAT6-305M', mrp: 10500, price: 7800, stock: 10, attributes: { length: '305 Meters', standard: 'Cat6 UTP' } },
      ],
      ['https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8b?auto=format&fit=crop&w=1200&q=80']
    );

    // Product 5: Hikvision Ceiling Dome
    addProduct(
      {
        id: 'prod-hik-ceiling-dome',
        name: 'Hikvision EXIR 4MP Indoor Ceiling Dome CCTV Camera',
        slug: 'hikvision-exir-4mp-indoor-ceiling-dome-camera',
        brandId: 'brand-hikvision',
        categoryId: 'sub-hd-cam',
        modelNumber: 'DS-2CE56D0T-IRMF',
        isFeatured: true,
        isCodAllowed: true,
        shortDesc: 'Vandal-resistant indoor/outdoor dome camera with built-in mic and 30m Smart IR.',
        description: 'Hikvision EXIR dome camera provides 4MP high-resolution surveillance with advanced infrared night vision and wide dynamic range.',
        specifications: {
          lens: '2.8mm Wide Angle',
          irRange: '30 Meters EXIR 2.0',
          protection: 'IP67 Weatherproof',
          power: '12V DC',
        },
      },
      [
        { name: '2.8mm Wide Angle', code: 'HIK-DOME-28MM', mrp: 3800, price: 2150, stock: 24, attributes: { lens: '2.8mm' } },
        { name: '3.6mm Standard Lens', code: 'HIK-DOME-36MM', mrp: 3800, price: 2150, stock: 18, attributes: { lens: '3.6mm' } },
      ],
      ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80']
    );

    // Product 6: D-Link Gigabit PoE Switch
    addProduct(
      {
        id: 'prod-dlink-poe-switch',
        name: 'D-Link 8-Port Gigabit PoE+ Unmanaged Metal Networking Switch',
        slug: 'd-link-8-port-gigabit-poe-switch',
        brandId: 'brand-d-link',
        categoryId: 'cat-accessories',
        modelNumber: 'DGS-1008P',
        isFeatured: true,
        isCodAllowed: true,
        shortDesc: '8-Port Gigabit Desktop Switch with 4 PoE+ Ports delivering up to 68W power budget.',
        description: 'High performance unmanaged gigabit switch engineered for IP security cameras and access points with full wire-speed switching.',
        specifications: {
          ports: '8x Gigabit RJ45 Ports',
          poeBudget: '68W PoE+ IEEE 802.3at',
          housing: 'Durable Metal Enclosure',
        },
      },
      [
        { name: '8-Port (4-PoE 68W)', code: 'DL-POE-8P-68W', mrp: 6200, price: 3850, stock: 16, attributes: { ports: 8, poe: '4-Port' } },
      ],
      ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80']
    );

    // Product 7: Lapcare SMPS Power Supply
    addProduct(
      {
        id: 'prod-lapcare-smps',
        name: 'Lapcare 12V 10A CCTV Regulated Multi-Channel SMPS Power Supply',
        slug: 'lapcare-12v-10a-cctv-smps-power-supply',
        brandId: 'brand-lapcare',
        categoryId: 'cat-accessories',
        modelNumber: 'LPS-1210-CCTV',
        isFeatured: false,
        isCodAllowed: true,
        shortDesc: 'Multi-camera power supply with surge, over-voltage, and short-circuit auto-recovery protection.',
        description: 'Engineered for 4 to 8 channel CCTV camera installations with individual channel fuse protection and high-efficiency heat dissipation.',
        specifications: {
          input: '190-260V AC 50Hz',
          output: '12V DC 10 Amperes',
          channels: '8 Terminal Outputs',
        },
      },
      [
        { name: '12V 10A 8-Channel', code: 'LAP-SMPS-10A', mrp: 2400, price: 1350, stock: 35, attributes: { channels: 8 } },
      ],
      ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80']
    );

    // Product 8: AOC Surveillance Monitor
    addProduct(
      {
        id: 'prod-aoc-monitor',
        name: 'AOC 24-inch Full HD 24/7 Security CCTV Surveillance Monitor',
        slug: 'aoc-24-inch-full-hd-cctv-surveillance-monitor',
        brandId: 'brand-aoc',
        categoryId: 'cat-accessories',
        modelNumber: '24B2H-SEC',
        isFeatured: true,
        isCodAllowed: true,
        shortDesc: '24/7 surveillance rated IPS panel with HDMI and VGA ports for DVR/NVR direct connection.',
        description: 'Commercial 24/7 monitoring display with ultra-wide viewing angles, anti-burn-in panel protection, and VESA mount capability.',
        specifications: {
          screen: '23.8-inch Full HD 1920x1080',
          panel: 'IPS Anti-Glare 75Hz',
          ports: 'HDMI, VGA, Audio Out',
        },
      },
      [
        { name: '24-inch FHD IPS', code: 'AOC-MON-24FHD', mrp: 11200, price: 7490, stock: 12, attributes: { size: '24-inch' } },
      ],
      ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80']
    );

    // Product 9: Pure Copper BNC Connectors
    addProduct(
      {
        id: 'prod-bnc-connectors',
        name: 'Pure Copper CCTV BNC Male Video Compression Connectors (Pack of 10)',
        slug: 'pure-copper-cctv-bnc-male-compression-connectors-pack-10',
        brandId: 'brand-cp-plus',
        categoryId: 'cat-accessories',
        modelNumber: 'BNC-COP-10',
        isFeatured: false,
        isCodAllowed: true,
        shortDesc: 'High conductivity copper BNC joints for crisp analog HD video transmission without line loss.',
        description: 'Premium copper connectors with solderless screw terminal attachments for quick on-site termination by CCTV installation engineers.',
        specifications: {
          material: 'Pure Copper with Gold Pin',
          impedance: '75 Ohms',
          pack: '10x BNC Male Joints',
        },
      },
      [
        { name: 'Pack of 10', code: 'BNC-COP-10PK', mrp: 650, price: 340, stock: 80, attributes: { pack: 10 } },
      ],
      ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8b?auto=format&fit=crop&w=1200&q=80']
    );

    // Product 10: Optilink Fiber Converter
    addProduct(
      {
        id: 'prod-optilink-fiber',
        name: 'Optilink Gigabit Single-Mode Optical Fiber Media Converter Pair (20km)',
        slug: 'optilink-gigabit-single-mode-fiber-media-converter-pair',
        brandId: 'brand-optilink',
        categoryId: 'cat-accessories',
        modelNumber: 'OP-MC-1000-SM',
        isFeatured: false,
        isCodAllowed: true,
        shortDesc: 'Gigabit fiber media converter pair (TX & RX) for long-distance surveillance camera transmission.',
        description: 'Converts 10/100/1000Base-TX copper ethernet signals to 1000Base-FX optical signals over single-mode optical fiber up to 20 kilometers.',
        specifications: {
          distance: 'Up to 20 Kilometers Single-Mode',
          fiberPort: 'SC Duplex Interface',
          dataRate: '10/100/1000 Mbps Auto-Negotiation',
        },
      },
      [
        { name: 'Pair (TX + RX 20km)', code: 'OPT-MC-20KM', mrp: 4500, price: 2750, stock: 15, attributes: { range: '20km' } },
      ],
      ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80']
    );

    // 5. Sample Commercial Orders for Admin & Reporting Telemetry
    const sampleOrder1 = {
      id: 'ord-seed-01',
      orderNumber: 'ORD-2026-9011',
      customerId: demoCust.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: 'RAZORPAY',
      subtotal: new Decimal(24800),
      gstAmount: new Decimal(4464),
      discountAmount: new Decimal(0),
      shippingAmount: new Decimal(0),
      totalAmount: new Decimal(29264),
      isB2B: true,
      companyName: 'Patel Security Solutions',
      gstin: '24AABCP1234F1Z9',
      notes: 'Commercial contractor procurement order',
      createdAt: new Date('2026-02-10T10:00:00Z'),
      updatedAt: new Date('2026-02-12T14:30:00Z'),
    };
    this.orders.push(sampleOrder1);

    this.shippingAddresses.push({
      id: 'addr-ord-1',
      orderId: sampleOrder1.id,
      recipientName: 'Rajesh Patel',
      phone: '9876543210',
      addressLine1: 'Shop 12, Ring Road Electronics Hub',
      addressLine2: 'Near Central Plaza',
      landmark: 'Opposite State Bank',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395003',
      createdAt: new Date('2026-02-10'),
    });

    this.orderItems.push(
      {
        id: 'oit-1',
        orderId: sampleOrder1.id,
        skuId: 'sku-CPP-001-4MP',
        productName: 'CP Plus Cosmic Series Smart IR Bullet Camera',
        variantName: '4MP Resolution (2K Quad-HD)',
        skuCode: 'CPP-001-4MP',
        quantity: 4,
        unitPrice: new Decimal(2350),
        totalPrice: new Decimal(9400),
        serialNumbers: ['CPP4M-2026-9901', 'CPP4M-2026-9902', 'CPP4M-2026-9903', 'CPP4M-2026-9904'],
        createdAt: new Date('2026-02-10'),
        updatedAt: new Date('2026-02-10'),
      },
      {
        id: 'oit-2',
        orderId: sampleOrder1.id,
        skuId: 'sku-HIK-DVR-08CH',
        productName: 'Hikvision AcuSense 1080p AI Digital Video Recorder',
        variantName: '8-Channel DVR',
        skuCode: 'HIK-DVR-08CH',
        quantity: 1,
        unitPrice: new Decimal(5400),
        totalPrice: new Decimal(5400),
        serialNumbers: ['HIK8CH-2026-7788'],
        createdAt: new Date('2026-02-10'),
        updatedAt: new Date('2026-02-10'),
      }
    );

    const ship1 = {
      id: 'ship-1',
      orderId: sampleOrder1.id,
      carrier: 'Delhivery Surface Express',
      awbNumber: 'DELH789123456IN',
      trackingUrl: 'https://www.delhivery.com/track/package/DELH789123456IN',
      status: 'DELIVERED',
      shippingLabelUrl: null,
      createdAt: new Date('2026-02-10T12:00:00Z'),
      updatedAt: new Date('2026-02-12T14:30:00Z'),
    };
    this.shipments.push(ship1);

    this.shipmentEvents.push(
      { id: 'ev-1', shipmentId: ship1.id, status: 'MANIFEST_GENERATED', location: 'Surat Central Hub', description: 'Consignment booked and manifest created', payload: { activity: 'Manifest generated' }, timestamp: new Date('2026-02-10T12:30:00Z') },
      { id: 'ev-2', shipmentId: ship1.id, status: 'IN_TRANSIT', location: 'Vadodara Transit Hub', description: 'Bagging and departure scan', payload: { activity: 'Departed Surat facility' }, timestamp: new Date('2026-02-11T04:15:00Z') },
      { id: 'ev-3', shipmentId: ship1.id, status: 'OUT_FOR_DELIVERY', location: 'Surat Ring Road Node', description: 'Out with delivery agent', payload: { activity: 'Out for final delivery' }, timestamp: new Date('2026-02-12T09:00:00Z') },
      { id: 'ev-4', shipmentId: ship1.id, status: 'DELIVERED', location: 'Consignee Address', description: 'Successfully handed over to recipient', payload: { activity: 'Delivered and OTP verified' }, timestamp: new Date('2026-02-12T14:30:00Z') }
    );

    this.payments.push({
      id: 'pay-1',
      orderId: sampleOrder1.id,
      method: 'RAZORPAY',
      gatewayPaymentId: 'pay_sim_99882211',
      gatewayOrderId: 'order_sim_112233',
      amount: new Decimal(29264),
      status: PaymentStatus.SUCCESS,
      createdAt: new Date('2026-02-10T10:05:00Z'),
      updatedAt: new Date('2026-02-10T10:05:00Z'),
    });

    // Sample Order 2 (Shipped, COD)
    const sampleOrder2 = {
      id: 'ord-seed-02',
      orderNumber: 'ORD-2026-9012',
      customerId: demoCust.id,
      status: OrderStatus.SHIPPED,
      paymentMethod: 'CASH_ON_DELIVERY',
      subtotal: new Decimal(7050),
      gstAmount: new Decimal(1269),
      discountAmount: new Decimal(0),
      shippingAmount: new Decimal(0),
      totalAmount: new Decimal(8319),
      isB2B: false,
      companyName: null,
      gstin: null,
      notes: null,
      createdAt: new Date('2026-03-01T14:00:00Z'),
      updatedAt: new Date('2026-03-02T11:00:00Z'),
    };
    this.orders.push(sampleOrder2);

    this.shippingAddresses.push({
      id: 'addr-ord-2',
      orderId: sampleOrder2.id,
      recipientName: 'Amit Sharma',
      phone: '9825012345',
      addressLine1: 'B-402, Shivalik Residency, Adajan',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395009',
      createdAt: new Date('2026-03-01'),
    });

    this.orderItems.push({
      id: 'oit-3',
      orderId: sampleOrder2.id,
      skuId: 'sku-ST-SKY-2TB',
      productName: 'Seagate SkyHawk 3.5-inch Surveillance Internal Hard Drive',
      variantName: '2TB Capacity',
      skuCode: 'ST-SKY-2TB',
      quantity: 1,
      unitPrice: new Decimal(5100),
      totalPrice: new Decimal(5100),
      serialNumbers: ['WDC2TB-901122'],
      createdAt: new Date('2026-03-01'),
      updatedAt: new Date('2026-03-01'),
    });

    const ship2 = {
      id: 'ship-2',
      orderId: sampleOrder2.id,
      carrier: 'Delhivery Surface',
      awbNumber: 'DELH991122334IN',
      trackingUrl: 'https://www.delhivery.com/track/package/DELH991122334IN',
      status: 'SHIPPED',
      shippingLabelUrl: null,
      createdAt: new Date('2026-03-02T10:00:00Z'),
      updatedAt: new Date('2026-03-02T10:00:00Z'),
    };
    this.shipments.push(ship2);
    this.shipmentEvents.push({
      id: 'ev-5',
      shipmentId: ship2.id,
      status: 'IN_TRANSIT',
      location: 'Surat Processing Node',
      description: 'Dispatched from warehouse',
      payload: { activity: 'In transit to local hub' },
      timestamp: new Date('2026-03-02T10:30:00Z'),
    });
  }
}

// Global singleton instance
const globalStore = (globalThis as any).__mockDataStore || new MockDataStore();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).__mockDataStore = globalStore;
}

// Helper filter matcher
function matchWhere(item: any, where?: any): boolean {
  if (!where) return true;

  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;

    if (key === 'OR' && Array.isArray(val)) {
      const matchAny = val.some((subWhere) => matchWhere(item, subWhere));
      if (!matchAny) return false;
      continue;
    }
    if (key === 'AND' && Array.isArray(val)) {
      const matchAll = val.every((subWhere) => matchWhere(item, subWhere));
      if (!matchAll) return false;
      continue;
    }
    if (key === 'NOT') {
      if (matchWhere(item, val)) return false;
      continue;
    }

    const itemVal = item[key];

    if (val !== null && typeof val === 'object') {
      if ('equals' in val) {
        if (itemVal !== val.equals) return false;
      }
      if ('not' in val) {
        if (itemVal === val.not) return false;
      }
      if ('in' in val && Array.isArray(val.in)) {
        if (!val.in.includes(itemVal)) return false;
      }
      if ('notIn' in val && Array.isArray(val.notIn)) {
        if (val.notIn.includes(itemVal)) return false;
      }
      if ('contains' in val) {
        const str = String(itemVal || '').toLowerCase();
        const sub = String(val.contains || '').toLowerCase();
        if (!str.includes(sub)) return false;
      }
      if ('startsWith' in val) {
        const str = String(itemVal || '');
        if (!str.startsWith(String((val as any).startsWith))) return false;
      }
      if ('gte' in val) {
        if (itemVal < (val as any).gte) return false;
      }
      if ('gt' in val) {
        if (itemVal <= (val as any).gt) return false;
      }
      if ('lte' in val) {
        if (itemVal > (val as any).lte) return false;
      }
      if ('lt' in val) {
        if (itemVal >= (val as any).lt) return false;
      }
    } else {
      if (itemVal !== val) return false;
    }
  }

  return true;
}

// Helper sorter
function sortList(list: any[], orderBy?: any) {
  if (!orderBy) return list;
  const copy = [...list];
  const orderList = Array.isArray(orderBy) ? orderBy : [orderBy];

  copy.sort((a, b) => {
    for (const ord of orderList) {
      for (const [k, dir] of Object.entries(ord)) {
        const valA = a[k];
        const valB = b[k];
        if (valA < valB) return dir === 'desc' ? 1 : -1;
        if (valA > valB) return dir === 'desc' ? -1 : 1;
      }
    }
    return 0;
  });
  return copy;
}

// Model repository factory
function createModelRepo(
  tableName: string,
  getList: () => any[],
  enrichRecord?: (rec: any, include?: any) => any
) {
  return {
    async findMany(args: any = {}) {
      const list = getList();
      let filtered = list.filter((item) => matchWhere(item, args.where));
      filtered = sortList(filtered, args.orderBy);

      if (args.skip) {
        filtered = filtered.slice(args.skip);
      }
      if (args.take) {
        filtered = filtered.slice(0, args.take);
      }

      if (enrichRecord) {
        return filtered.map((r) => enrichRecord(r, args.include));
      }
      return filtered;
    },

    async findFirst(args: any = {}) {
      const list = getList();
      let filtered = list.filter((item) => matchWhere(item, args.where));
      filtered = sortList(filtered, args.orderBy);
      const first = filtered[0] || null;
      if (first && enrichRecord) {
        return enrichRecord(first, args.include);
      }
      return first;
    },

    async findUnique(args: any = {}) {
      const list = getList();
      const found = list.find((item) => matchWhere(item, args.where)) || null;
      if (found && enrichRecord) {
        return enrichRecord(found, args.include);
      }
      return found;
    },

    async create(args: any = {}) {
      const list = getList();
      const id = args.data?.id || `${tableName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const data = { ...args.data };

      if (tableName === 'order' && data.items?.create) {
        const itemsToCreate = Array.isArray(data.items.create) ? data.items.create : [data.items.create];
        for (const it of itemsToCreate) {
          globalStore.orderItems.push({
            id: it.id || `oit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            orderId: id,
            skuId: it.skuId,
            productName: it.productName,
            variantName: it.variantName,
            skuCode: it.skuCode,
            quantity: it.quantity,
            unitPrice: new Decimal(it.unitPrice),
            totalPrice: new Decimal(it.totalPrice || Number(it.unitPrice) * it.quantity),
            serialNumbers: it.serialNumbers || [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        delete data.items;
      }

      if (tableName === 'order' && data.shippingAddress?.create) {
        globalStore.shippingAddresses.push({
          id: data.shippingAddress.create.id || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          orderId: id,
          ...data.shippingAddress.create,
          createdAt: new Date(),
        });
        delete data.shippingAddress;
      }

      if (tableName === 'user' && data.customer?.create) {
        const custId = data.customer.create.id || `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        globalStore.customers.push({
          id: custId,
          userId: id,
          ...data.customer.create,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        delete data.customer;
      }

      if (tableName === 'shipment' && data.events?.create) {
        const eventsToCreate = Array.isArray(data.events.create) ? data.events.create : [data.events.create];
        for (const ev of eventsToCreate) {
          globalStore.shipmentEvents.push({
            id: ev.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            shipmentId: id,
            ...ev,
            timestamp: ev.timestamp || new Date(),
          });
        }
        delete data.events;
      }

      if (tableName === 'user' && data.adminProfile?.create) {
        globalStore.adminProfiles.push({
          id: `admin-prof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userId: id,
          ...data.adminProfile.create,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        delete data.adminProfile;
      }

      const newRec = {
        ...data,
        id,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
      };
      list.push(newRec);
      if (enrichRecord) {
        return enrichRecord(newRec, args.include || { items: true, shippingAddress: true, customer: true });
      }
      return newRec;
    },

    async update(args: any = {}) {
      const list = getList();
      const idx = list.findIndex((item) => matchWhere(item, args.where));
      if (idx === -1) {
        throw new Error(`Record to update not found in ${tableName}`);
      }
      const existing = list[idx];
      const updated = {
        ...existing,
        ...args.data,
        updatedAt: new Date(),
      };
      list[idx] = updated;
      if (enrichRecord) {
        return enrichRecord(updated, args.include);
      }
      return updated;
    },

    async delete(args: any = {}) {
      const list = getList();
      const idx = list.findIndex((item) => matchWhere(item, args.where));
      if (idx === -1) {
        throw new Error(`Record to delete not found in ${tableName}`);
      }
      const removed = list.splice(idx, 1)[0];
      return removed;
    },

    async deleteMany(args: any = {}) {
      const list = getList();
      if (!args.where) {
        const count = list.length;
        list.length = 0;
        return { count };
      }
      let count = 0;
      for (let i = list.length - 1; i >= 0; i--) {
        if (matchWhere(list[i], args.where)) {
          list.splice(i, 1);
          count++;
        }
      }
      return { count };
    },

    async count(args: any = {}) {
      const list = getList();
      const filtered = list.filter((item) => matchWhere(item, args.where));
      return filtered.length;
    },

    async aggregate(args: any = {}) {
      const list = getList();
      const filtered = list.filter((item) => matchWhere(item, args.where));
      const res: any = { _count: filtered.length };
      if (args._sum) {
        res._sum = {};
        for (const [key, enabled] of Object.entries(args._sum)) {
          if (enabled) {
            res._sum[key] = filtered.reduce((acc, it) => acc + (Number(it[key]) || 0), 0);
          }
        }
      }
      return res;
    },
  };
}

// Record enrichment functions
function enrichProduct(prod: any, include?: any) {
  if (!prod) return null;
  const res = { ...prod };

  if (include?.brand) {
    res.brand = globalStore.brands.find((b: any) => b.id === prod.brandId) || null;
  }
  if (include?.category) {
    res.category = globalStore.categories.find((c: any) => c.id === prod.categoryId) || null;
  }
  if (include?.images) {
    let imgs = globalStore.productImages.filter((img: any) => img.productId === prod.id);
    imgs.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (include.images.take) imgs = imgs.slice(0, include.images.take);
    res.images = imgs;
  }
  if (include?.variants) {
    const vars = globalStore.productVariants.filter((v: any) => v.productId === prod.id);
    res.variants = vars.map((v: any) => {
      const vRes = { ...v };
      if (include.variants.include?.sku) {
        const sku = globalStore.skus.find((s: any) => s.id === v.skuId);
        if (sku) {
          const skuRes = { ...sku };
          if (include.variants.include.sku.include?.inventory) {
            skuRes.inventory = globalStore.inventories.find((inv: any) => inv.skuId === sku.id) || null;
          }
          vRes.sku = skuRes;
        } else {
          vRes.sku = null;
        }
      }
      return vRes;
    });
  }

  return res;
}

function enrichSku(sku: any, include?: any) {
  if (!sku) return null;
  const res = { ...sku };

  if (include?.inventory) {
    res.inventory = globalStore.inventories.find((inv: any) => inv.skuId === sku.id) || null;
  }
  if (include?.variant) {
    const variant = globalStore.productVariants.find((v: any) => v.skuId === sku.id) || null;
    if (variant && include.variant.include?.product) {
      const prod = globalStore.products.find((p: any) => p.id === variant.productId) || null;
      res.variant = { ...variant, product: prod ? enrichProduct(prod, include.variant.include.product.include) : null };
    } else {
      res.variant = variant;
    }
  }
  if (include?.movements) {
    let movs = globalStore.inventoryMovements.filter((m: any) => m.skuId === sku.id);
    movs.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
    if (include.movements.take) movs = movs.slice(0, include.movements.take);
    res.movements = movs;
  }

  return res;
}

function enrichInventory(inv: any, include?: any) {
  if (!inv) return null;
  const res = { ...inv };
  if (include?.sku) {
    const sku = globalStore.skus.find((s: any) => s.id === inv.skuId);
    res.sku = sku ? enrichSku(sku, include.sku.include) : null;
  }
  return res;
}

function enrichCategory(cat: any, include?: any) {
  if (!cat) return null;
  const res = { ...cat };
  if (include?.children) {
    res.children = globalStore.categories.filter((c: any) => c.parentId === cat.id && matchWhere(c, include.children.where));
  }
  if (include?._count?.select?.products) {
    const count = globalStore.products.filter((p: any) => p.categoryId === cat.id && p.isActive).length;
    res._count = { products: count };
  }
  return res;
}

function enrichBrand(brand: any, include?: any) {
  if (!brand) return null;
  const res = { ...brand };
  if (include?._count?.select?.products) {
    const count = globalStore.products.filter((p: any) => p.brandId === brand.id && p.isActive).length;
    res._count = { products: count };
  }
  return res;
}

function enrichCart(cart: any, include?: any) {
  if (!cart) return null;
  const res = { ...cart };
  if (include?.items) {
    const items = globalStore.cartItems.filter((it: any) => it.cartId === cart.id);
    res.items = items.map((it: any) => {
      const itRes = { ...it };
      if (include.items.include?.sku) {
        const sku = globalStore.skus.find((s: any) => s.id === it.skuId);
        itRes.sku = sku ? enrichSku(sku, include.items.include.sku.include) : null;
      }
      return itRes;
    });
  }
  return res;
}

function enrichOrder(ord: any, include?: any) {
  if (!ord) return null;
  const res = { ...ord };
  if (include?.shippingAddress) {
    res.shippingAddress = globalStore.shippingAddresses.find((a: any) => a.orderId === ord.id)
      || globalStore.customerAddresses.find((a: any) => a.id === ord.shippingAddressId)
      || null;
  }
  if (include?.items) {
    res.items = globalStore.orderItems.filter((it: any) => it.orderId === ord.id);
  }
  if (include?.shipments) {
    const ships = globalStore.shipments.filter((s: any) => s.orderId === ord.id);
    res.shipments = ships.map((s: any) => ({
      ...s,
      events: globalStore.shipmentEvents.filter((e: any) => e.shipmentId === s.id),
    }));
  }
  if (include?.payments) {
    res.payments = globalStore.payments.filter((p: any) => p.orderId === ord.id);
  }
  if (include?.customer) {
    res.customer = globalStore.customers.find((c: any) => c.id === ord.customerId) || null;
  }
  return res;
}

function enrichUser(usr: any, include?: any) {
  if (!usr) return null;
  const res = { ...usr };
  if (include?.adminProfile) {
    res.adminProfile = globalStore.adminProfiles.find((p: any) => p.userId === usr.id) || null;
  }
  if (include?.customer) {
    const cust = globalStore.customers.find((c: any) => c.userId === usr.id) || null;
    if (cust && include.customer.include?.addresses) {
      const addrs = globalStore.customerAddresses.filter((a: any) => a.customerId === cust.id);
      res.customer = { ...cust, addresses: addrs };
    } else {
      res.customer = cust;
    }
  }
  return res;
}

function enrichShipment(ship: any, include?: any) {
  if (!ship) return null;
  const res = { ...ship };
  if (include?.events || true) {
    res.events = globalStore.shipmentEvents.filter((e: any) => e.shipmentId === ship.id);
  }
  if (include?.order) {
    const ord = globalStore.orders.find((o: any) => o.id === ship.orderId);
    res.order = ord ? enrichOrder(ord, include.order.include) : null;
  }
  return res;
}

// Assemble mock Prisma client
export const mockPrisma: any = {
  user: createModelRepo('user', () => globalStore.users, enrichUser),
  adminProfile: createModelRepo('adminProfile', () => globalStore.adminProfiles),
  customer: createModelRepo('customer', () => globalStore.customers, (c: any, inc?: any) => {
    if (!c) return null;
    const res = { ...c };
    if (inc?.addresses || true) {
      let addrs = globalStore.customerAddresses.filter((a: any) => a.customerId === c.id);
      if (inc?.addresses?.where) {
        addrs = addrs.filter((a: any) => matchWhere(a, inc.addresses.where));
      }
      if (inc?.addresses?.take) {
        addrs = addrs.slice(0, inc.addresses.take);
      }
      res.addresses = addrs;
    }
    if (inc?.user || true) {
      res.user = globalStore.users.find((u: any) => u.id === c.userId) || { phone: '+919876543210', email: 'customer@patelnetworks.in' };
    }
    if (inc?.orders || true) {
      let ords = globalStore.orders.filter((o: any) => o.customerId === c.id);
      ords = sortList(ords, inc?.orders?.orderBy || { createdAt: 'desc' });
      res.orders = ords;
    }
    return res;
  }),
  address: createModelRepo('address', () => globalStore.customerAddresses),
  customerAddress: createModelRepo('customerAddress', () => globalStore.customerAddresses),
  brand: createModelRepo('brand', () => globalStore.brands, enrichBrand),
  category: createModelRepo('category', () => globalStore.categories, enrichCategory),
  product: createModelRepo('product', () => globalStore.products, enrichProduct),
  productImage: createModelRepo('productImage', () => globalStore.productImages),
  productVariant: createModelRepo('productVariant', () => globalStore.productVariants),
  sku: createModelRepo('sku', () => globalStore.skus, enrichSku),
  inventory: createModelRepo('inventory', () => globalStore.inventories, enrichInventory),
  inventoryMovement: createModelRepo('inventoryMovement', () => globalStore.inventoryMovements),
  cart: createModelRepo('cart', () => globalStore.carts, enrichCart),
  cartItem: createModelRepo('cartItem', () => globalStore.cartItems),
  order: createModelRepo('order', () => globalStore.orders, enrichOrder),
  orderItem: createModelRepo('orderItem', () => globalStore.orderItems),
  shippingAddress: createModelRepo('shippingAddress', () => globalStore.shippingAddresses),
  shipment: createModelRepo('shipment', () => globalStore.shipments, enrichShipment),
  shipmentEvent: createModelRepo('shipmentEvent', () => globalStore.shipmentEvents),
  payment: createModelRepo('payment', () => globalStore.payments),
  paymentEvent: createModelRepo('paymentEvent', () => globalStore.paymentEvents),
  orderStatusHistory: createModelRepo('orderStatusHistory', () => globalStore.orderStatusHistories),
  otpVerification: createModelRepo('otpVerification', () => globalStore.otpVerifications),
  b2BQuoteInquiry: createModelRepo('b2BQuoteInquiry', () => globalStore.b2bQuoteInquiries),
  auditLog: createModelRepo('auditLog', () => globalStore.auditLogs),

  async $transaction(arg: any) {
    if (typeof arg === 'function') {
      return await arg(mockPrisma);
    }
    if (Array.isArray(arg)) {
      return await Promise.all(arg);
    }
    return arg;
  },

  async $queryRaw(..._args: any[]) {
    return [{ 1: 1 }];
  },

  async $executeRaw(..._args: any[]) {
    return 1;
  },

  async $connect() {
    return Promise.resolve();
  },

  async $disconnect() {
    return Promise.resolve();
  },
};
