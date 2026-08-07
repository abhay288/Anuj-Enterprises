export const INITIAL_PRODUCTS = [
  {
    id: "prod-101",
    name: "Bosch Professional GSB 18V-50 Cordless Impact Drill",
    brand: "Bosch",
    category: "Power Tools",
    sku: "BSH-DRL-18V-01",
    hsn: "84672100",
    price: 14500,
    mrp: 18900,
    gstRate: 18,
    stock: 45,
    minOrderQty: 2,
    rating: 4.8,
    reviewCount: 124,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Heavy-duty 18V brushless motor cordless impact driver designed for industrial construction, metalworking, and heavy maintenance. Comes with twin 5.0Ah Li-ion batteries and L-BOXX carrying case.",
    specs: {
      "Motor Type": "Brushless DC",
      "Torque (Max)": "50 Nm",
      "No-Load Speed": "0-1800 RPM",
      "Chuck Capacity": "1.5 - 13 mm",
      "Battery Capacity": "2x 18V 5.0Ah",
      "Warranty": "2 Years Manufacturer Warranty",
      "Country of Origin": "Germany"
    },
    bulkTiers: [
      { qty: "1 - 5 units", price: 14500 },
      { qty: "6 - 20 units", price: 13800 },
      { qty: "21+ units", price: 12900 }
    ]
  },
  {
    id: "prod-102",
    name: "Schneider Electric EasyPact CVS 400A 3P MCCB",
    brand: "Schneider Electric",
    category: "Electrical & Automation",
    sku: "SE-MCCB-400A-3P",
    hsn: "85362090",
    price: 38200,
    mrp: 46000,
    gstRate: 18,
    stock: 18,
    minOrderQty: 1,
    rating: 4.9,
    reviewCount: 88,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Enterprise class Molded Case Circuit Breaker (MCCB) rated for 400A breaking capacity 36kA 415V. Designed for industrial power distribution and motor protection control panels.",
    specs: {
      "Rated Current": "400 Ampere",
      "Poles": "3 Pole (3P)",
      "Breaking Capacity": "36 kA at 415V AC",
      "Trip Unit": "TM-D Thermal-Magnetic",
      "Standard Compliance": "IEC 60947-2",
      "Warranty": "1 Year Standard Warranty",
      "Country of Origin": "France"
    },
    bulkTiers: [
      { qty: "1 - 3 units", price: 38200 },
      { qty: "4 - 10 units", price: 36500 },
      { qty: "11+ units", price: 34200 }
    ]
  },
  {
    id: "prod-103",
    name: "SKF Explorer 22220 EK Spherical Roller Bearing",
    brand: "SKF",
    category: "Bearings & Power Transmission",
    sku: "SKF-BRG-22220EK",
    hsn: "84823000",
    price: 8900,
    mrp: 11500,
    gstRate: 18,
    stock: 60,
    minOrderQty: 5,
    rating: 4.7,
    reviewCount: 96,
    isFeatured: true,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
    ],
    description: "High-load capacity double row self-aligning spherical roller bearing with tapered bore 1:12. Built for heavy mining, steel plants, and industrial conveyors.",
    specs: {
      "Bore Diameter": "100 mm",
      "Outer Diameter": "180 mm",
      "Width": "46 mm",
      "Dynamic Load Rating": "432 kN",
      "Limiting Speed": "3800 RPM",
      "Cage Material": "Stamped Steel",
      "Country of Origin": "Sweden"
    },
    bulkTiers: [
      { qty: "5 - 19 units", price: 8900 },
      { qty: "20 - 50 units", price: 8400 },
      { qty: "51+ units", price: 7850 }
    ]
  },
  {
    id: "prod-104",
    name: "3M SecureClick Half Facepiece Respirator HF-800SD",
    brand: "3M",
    category: "Safety & PPE",
    sku: "3M-SAF-HF800SD",
    hsn: "90200000",
    price: 3200,
    mrp: 4100,
    gstRate: 18,
    stock: 120,
    minOrderQty: 10,
    rating: 4.9,
    reviewCount: 215,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Next-generation silicone facepiece with speaking diaphragm for clear workplace communication. Features dual-flow cartridge system for ultra-low breathing resistance in hazardous environments.",
    specs: {
      "Facepiece Material": "Medical Silicone",
      "Seal Check Button": "One-touch Push Button",
      "Certifications": "NIOSH / EN 140",
      "Speaking Diaphragm": "Included",
      "Recommended Industry": "Chemical, Oil & Gas, Mining, Pharma"
    },
    bulkTiers: [
      { qty: "10 - 49 units", price: 3200 },
      { qty: "50 - 200 units", price: 2950 },
      { qty: "201+ units", price: 2700 }
    ]
  },
  {
    id: "prod-105",
    name: "Siemens SIMATIC S7-1200 CPU 1214C PLC Module",
    brand: "Siemens",
    category: "Electrical & Automation",
    sku: "SIE-PLC-1214C-DC",
    hsn: "85371000",
    price: 42500,
    mrp: 52000,
    gstRate: 18,
    stock: 12,
    minOrderQty: 1,
    rating: 5.0,
    reviewCount: 42,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Compact PLC controller module with integrated 14 Digital Inputs, 10 Digital Outputs, and 2 Analog Inputs. PROFINET port interface for seamless SCADA & IoT industrial integration.",
    specs: {
      "Supply Voltage": "24V DC",
      "Work Memory": "100 KB Integrated",
      "Digital I/O": "14 DI / 10 DO (Transistor)",
      "Communication": "1x PROFINET RJ45 Port",
      "Software": "STEP 7 V16+",
      "Country of Origin": "Germany"
    },
    bulkTiers: [
      { qty: "1 - 2 units", price: 42500 },
      { qty: "3 - 5 units", price: 40500 },
      { qty: "6+ units", price: 38000 }
    ]
  },
  {
    id: "prod-106",
    name: "Makita LW1400 355mm Metal Cut-Off Saw 2200W",
    brand: "Makita",
    category: "Power Tools",
    sku: "MAK-SAW-LW1400",
    hsn: "84615011",
    price: 16800,
    mrp: 21000,
    gstRate: 18,
    stock: 25,
    minOrderQty: 1,
    rating: 4.7,
    reviewCount: 63,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Heavy duty 355mm (14-inch) metal abrasive chop saw. Powered by a high torque 2200W motor with tool-less vise adjustment and spark guard guard system.",
    specs: {
      "Power Input": "2200 Watts",
      "Wheel Diameter": "355 mm (14 inch)",
      "No-Load Speed": "3800 RPM",
      "Cutting Capacity": "127 mm (Pipe) / 119 mm (Square Tube)",
      "Weight": "17.2 kg",
      "Country of Origin": "Japan"
    },
    bulkTiers: [
      { qty: "1 - 4 units", price: 16800 },
      { qty: "5 - 15 units", price: 15900 },
      { qty: "16+ units", price: 14950 }
    ]
  },
  {
    id: "prod-107",
    name: "L&T MNX 110 3P AC-3 Power Contactor 110A",
    brand: "L&T Electrical",
    category: "Electrical & Automation",
    sku: "LT-CNT-MNX110",
    hsn: "85364900",
    price: 11200,
    mrp: 14800,
    gstRate: 18,
    stock: 35,
    minOrderQty: 2,
    rating: 4.8,
    reviewCount: 77,
    isFeatured: false,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
    ],
    description: "L&T MNX range heavy-duty 3 pole AC contactor rated for 110 Ampere current at AC-3 duty 415V. Ideal for heavy motor starters, HVAC systems, and capacitor switching.",
    specs: {
      "Rated Operational Current": "110A (AC-3) / 160A (AC-1)",
      "Coil Voltage": "240V AC 50Hz",
      "Auxiliary Contacts": "2 NO + 2 NC",
      "Poles": "3 Main Poles",
      "Country of Origin": "India"
    },
    bulkTiers: [
      { qty: "2 - 9 units", price: 11200 },
      { qty: "10 - 30 units", price: 10500 },
      { qty: "31+ units", price: 9800 }
    ]
  },
  {
    id: "prod-108",
    name: "Yuken Solenoid Operated Directional Valve DSG-01-3C2",
    brand: "Yuken Hydraulics",
    category: "Hydraulics & Pneumatics",
    sku: "YUK-VAL-DSG01",
    hsn: "84812000",
    price: 12400,
    mrp: 15500,
    gstRate: 18,
    stock: 14,
    minOrderQty: 1,
    rating: 4.9,
    reviewCount: 39,
    isFeatured: true,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
    ],
    description: "High pressure 31.5 MPa hydraulic directional control valve CETOP 3 (NG6). Features wet armature solenoids for low switching noise and zero fluid leakage.",
    specs: {
      "Max Operating Pressure": "31.5 MPa (315 bar)",
      "Max Flow Rate": "100 L/min",
      "Spool Type": "3C2 (Closed Center)",
      "Solenoid Voltage": "24V DC",
      "Mounting Subplate": "CETOP 3 / ISO 4401-03",
      "Country of Origin": "Japan"
    },
    bulkTiers: [
      { qty: "1 - 3 units", price: 12400 },
      { qty: "4 - 10 units", price: 11700 },
      { qty: "11+ units", price: 10900 }
    ]
  },
  {
    id: "prod-109",
    name: "Karam PN56 Full Body Safety Harness with Lanyard",
    brand: "Karam Safety",
    category: "Safety & PPE",
    sku: "KRM-HAR-PN56",
    hsn: "63079090",
    price: 2450,
    mrp: 3200,
    gstRate: 18,
    stock: 150,
    minOrderQty: 5,
    rating: 4.8,
    reviewCount: 312,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Heavy-duty industrial fall protection full body harness with dorsal D-ring, adjustable thigh straps, and integrated 2m dual branch energy absorbing lanyard.",
    specs: {
      "Webbing Material": "High Tenacity Polyester 44mm",
      "D-Rings": "1 Dorsal D-Ring (Forged Steel)",
      "Lanyard Length": "2.0 Meters Twin Lanyard with Scaffold Hooks",
      "Certification": "IS 3521:1999 & EN 361:2002",
      "Max User Weight": "140 kg"
    },
    bulkTiers: [
      { qty: "5 - 24 units", price: 2450 },
      { qty: "25 - 100 units", price: 2200 },
      { qty: "101+ units", price: 1980 }
    ]
  },
  {
    id: "prod-110",
    name: "ESAB Invertec 200A TIG/MMA Welding Inverter",
    brand: "ESAB",
    category: "Welding & Metalworking",
    sku: "ESB-WLD-200A",
    hsn: "85153990",
    price: 29800,
    mrp: 37500,
    gstRate: 18,
    stock: 9,
    minOrderQty: 1,
    rating: 4.9,
    reviewCount: 54,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Professional grade single phase 200A IGBT inverter welding machine for TIG HF ignition and MMA stick electrode welding. Digital display panel and arc force control.",
    specs: {
      "Current Range": "10A - 200A DC",
      "Input Power": "230V 1-Phase 50/60Hz",
      "Duty Cycle": "60% @ 200A",
      "Electrode Size": "1.6mm - 4.0mm",
      "Protection Class": "IP23S Industrial",
      "Country of Origin": "Sweden"
    },
    bulkTiers: [
      { qty: "1 - 2 units", price: 29800 },
      { qty: "3 - 5 units", price: 28200 },
      { qty: "6+ units", price: 26500 }
    ]
  },
  {
    id: "prod-111",
    name: "High Tensile Grade 10.9 Allen Hex Bolt Set M16x60",
    brand: "Unbrako Fasteners",
    category: "Fasteners & Hardware",
    sku: "UNB-BLT-M16-60",
    hsn: "73181500",
    price: 48,
    mrp: 65,
    gstRate: 18,
    stock: 5000,
    minOrderQty: 100,
    rating: 4.8,
    reviewCount: 140,
    isFeatured: false,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Heavy duty alloy steel Socket Head Cap Screw (Allen Bolt) Grade 10.9 with black oxide coating. Designed for high pressure flange connections and heavy machinery.",
    specs: {
      "Thread Size": "M16 x 2.0mm Pitch",
      "Length": "60 mm",
      "Property Class": "Grade 10.9 (1000 MPa Tensile)",
      "Material": "Alloy Steel Quenched & Tempered",
      "Standard": "DIN 912 / ISO 4762"
    },
    bulkTiers: [
      { qty: "100 - 499 units", price: 48 },
      { qty: "500 - 2000 units", price: 42 },
      { qty: "2001+ units", price: 36 }
    ]
  },
  {
    id: "prod-112",
    name: "ABB ACS380 7.5kW 10HP Variable Frequency Drive (VFD)",
    brand: "ABB",
    category: "Electrical & Automation",
    sku: "ABB-VFD-ACS380-7.5KW",
    hsn: "85044090",
    price: 48500,
    mrp: 59000,
    gstRate: 18,
    stock: 7,
    minOrderQty: 1,
    rating: 5.0,
    reviewCount: 33,
    isFeatured: true,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Machinery drive for precise speed control of 3-phase induction motors. Built-in Modbus RTU interface, EMC filter, and safe torque off (STO) function for safety.",
    specs: {
      "Motor Rating": "7.5 kW / 10 HP",
      "Input Voltage": "380 - 480V 3-Phase",
      "Output Current": "17.0 Amps",
      "Enclosure Rating": "IP20 / UL Open Type",
      "Warranty": "2 Years ABB Direct Warranty"
    },
    bulkTiers: [
      { qty: "1 - 2 units", price: 48500 },
      { qty: "3 - 5 units", price: 46000 },
      { qty: "6+ units", price: 43500 }
    ]
  }
];

export const INITIAL_CATEGORIES = [
  { id: "cat-1", name: "Power Tools", count: 142, icon: "Wrench", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-2", name: "Electrical & Automation", count: 320, icon: "Zap", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-3", name: "Bearings & Power Transmission", count: 210, icon: "Cog", image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-4", name: "Safety & PPE", count: 185, icon: "ShieldCheck", image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-5", name: "Hydraulics & Pneumatics", count: 98, icon: "Cpu", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-6", name: "Fasteners & Hardware", count: 650, icon: "Layers", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-7", name: "Welding & Metalworking", count: 88, icon: "Flame", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-8", name: "Heavy Machinery & Parts", count: 74, icon: "Truck", image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80" }
];

export const INITIAL_BRANDS = [
  { id: "b1", name: "Bosch", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80", count: 48, country: "Germany" },
  { id: "b2", name: "Siemens", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80", count: 62, country: "Germany" },
  { id: "b3", name: "Schneider Electric", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80", count: 85, country: "France" },
  { id: "b4", name: "SKF", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80", count: 110, country: "Sweden" },
  { id: "b5", name: "3M", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80", count: 95, country: "USA" },
  { id: "b6", name: "Makita", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80", count: 34, country: "Japan" },
  { id: "b7", name: "L&T Electrical", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80", count: 72, country: "India" },
  { id: "b8", name: "ABB", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80", count: 53, country: "Switzerland" }
];

export const INITIAL_SALESMEN = [
  { id: "SLS-101", name: "Vikram Malhotra", email: "vikram.m@anujenterprises.com", phone: "+91 98201 44512", region: "West India (Mumbai HQ)", salesVolume: "₹ 48.5 Lakhs", ordersCount: 142, status: "Active" },
  { id: "SLS-102", name: "Priya Sharma", email: "priya.s@anujenterprises.com", phone: "+91 98110 33219", region: "North India (Delhi NCR)", salesVolume: "₹ 36.2 Lakhs", ordersCount: 98, status: "Active" },
  { id: "SLS-103", name: "Rajesh Kumar", email: "rajesh.k@anujenterprises.com", phone: "+91 99400 12890", region: "South India (Bengaluru Hub)", salesVolume: "₹ 52.8 Lakhs", ordersCount: 165, status: "Active" },
  { id: "SLS-104", name: "Anand Verma", email: "anand.v@anujenterprises.com", phone: "+91 97300 88211", region: "East India (Kolkata Hub)", salesVolume: "₹ 19.4 Lakhs", ordersCount: 44, status: "Active" }
];

export const INITIAL_ORDERS = [
  {
    id: "INV-2026-089",
    date: "2026-08-06",
    customerName: "Tata Steel Projects Ltd.",
    customerGstin: "27AAACT1234F1Z8",
    salesmanId: "SLS-101",
    salesmanName: "Vikram Malhotra",
    items: [
      { id: "prod-102", name: "Schneider Electric EasyPact CVS 400A 3P MCCB", sku: "SE-MCCB-400A-3P", qty: 2, price: 38200 },
      { id: "prod-105", name: "Siemens SIMATIC S7-1200 CPU 1214C PLC Module", sku: "SIE-PLC-1214C-DC", qty: 1, price: 42500 }
    ],
    subtotal: 118900,
    cgst: 10701,
    sgst: 10701,
    totalGst: 21402,
    grandTotal: 140302,
    status: "Delivered",
    paymentMode: "Net 30 Days B2B Credit"
  },
  {
    id: "INV-2026-088",
    date: "2026-08-05",
    customerName: "L&T Hydrocarbon Engineering",
    customerGstin: "27AAACL9921D1ZB",
    salesmanId: "SLS-103",
    salesmanName: "Rajesh Kumar",
    items: [
      { id: "prod-101", name: "Bosch Professional GSB 18V-50 Cordless Impact Drill", sku: "BSH-DRL-18V-01", qty: 5, price: 13800 },
      { id: "prod-104", name: "3M SecureClick Half Facepiece Respirator HF-800SD", sku: "3M-SAF-HF800SD", qty: 20, price: 2950 }
    ],
    subtotal: 128000,
    cgst: 11520,
    sgst: 11520,
    totalGst: 23040,
    grandTotal: 151040,
    status: "Invoiced",
    paymentMode: "Bank NEFT Transfer"
  },
  {
    id: "INV-2026-087",
    date: "2026-08-04",
    customerName: "Reliance Industries Manufacturing Div",
    customerGstin: "27AAACR4412P1ZX",
    salesmanId: "SLS-101",
    salesmanName: "Vikram Malhotra",
    items: [
      { id: "prod-103", name: "SKF Explorer 22220 EK Spherical Roller Bearing", sku: "SKF-BRG-22220EK", qty: 25, price: 8400 }
    ],
    subtotal: 210000,
    cgst: 18900,
    sgst: 18900,
    totalGst: 37800,
    grandTotal: 247800,
    status: "Shipped",
    paymentMode: "Net 15 Days Credit"
  }
];
