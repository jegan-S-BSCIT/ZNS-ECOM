// Complete Product Catalog for Zen Nova Solutions (Cosmetics & Health Care)
// 5 connected product families: Hair Care, Skin Care, Cosmetics, Health Care, Wellness

export const CATEGORIES = [
  { id: 'hair-care', name: 'Hair Care', description: 'Shampoo, conditioner, hair oils, serums & growth treatments.', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80' },
  { id: 'skin-care', name: 'Skin Care', description: 'Cleansers, moisturizers, serums, sunscreen & masks.', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
  { id: 'cosmetics', name: 'Cosmetics', description: 'Face, eye, lip & skin finish makeup products.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
  { id: 'health-care', name: 'Health Care', description: 'OTC essentials, personal care devices, hygiene & first-aid.', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
  { id: 'wellness', name: 'Wellness', description: 'Supplements, vitamins, sleep & stress support & rituals.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80' }
];

export const CONCERNS = [
  { id: 'hair-fall', name: 'Hair Fall', tag: 'hair-fall', icon: '🍃', description: 'Strengthen roots & reduce breakage' },
  { id: 'dry-hair', name: 'Dry Hair', tag: 'dry-hair', icon: '💧', description: 'Deep nourishment & frizz control' },
  { id: 'skin-hydration', name: 'Skin Hydration', tag: 'skin-hydration', icon: '✨', description: 'Lock in 24h barrier moisture' },
  { id: 'acne-care', name: 'Acne Care', tag: 'acne-care', icon: '🌱', description: 'Clear pores & calm inflammation' },
  { id: 'dull-skin', name: 'Dull Skin', tag: 'dull-skin', icon: '🌟', description: 'Brighten complexion & even skin tone' },
  { id: 'daily-wellness', name: 'Daily Wellness', tag: 'daily-wellness', icon: '🧘', description: 'Routine vitals, energy & immunity' }
];

const PRODUCTS = [
  // ── HAIR CARE ───────────────────────────────────────────
  {
    id: "hc-01",
    slug: "rosemary-biotin-hair-growth-oil",
    name: "Rosemary & Biotin Root Reviving Hair Oil",
    category: "hair-care",
    concerns: ["hair-fall", "dry-hair"],
    price: 599,
    originalPrice: 799,
    rating: 4.8,
    reviewCount: 342,
    benefitLine: "Reduces hair fall by 84% and stimulates dormant scalp follicles.",
    shortBullets: [
      "Clinical strength cold-pressed Rosemary Oil & Biotin complex",
      "Non-greasy, lightweight texture suitable for overnight treatment",
      "Dermatologically tested and free from mineral oil & parabens"
    ],
    description: "Formulated with therapeutic grade Rosemary essential oil, pure Biotin, and cold-pressed Bhringraj, this root-reviving elixir penetrates deep into the follicle shaft to reactivate stagnant growth cycles and prevent hair fall.",
    expandedBenefits: "Improves scalp micro-circulation, fortifies weak strands against breakage, and tames unruly frizz while leaving a subtle natural herbaceous aroma.",
    ingredients: {
      inci: "Rosmarinus Officinalis (Rosemary) Leaf Oil, Biotin (Vitamin B7), Eclipta Prostrata (Bhringraj) Extract, Sesamum Indicum (Sesame) Seed Oil, Tocopherol (Vitamin E), Emblica Officinalis (Amla) Fruit Extract.",
      heroIngredients: [
        { name: "Rosemary Oil", benefit: "Inhibits DHT production to combat hair loss and stimulate microcirculation." },
        { name: "Biotin", benefit: "Increases keratin protein structure for thicker strand diameter." },
        { name: "Cold-Pressed Bhringraj", benefit: "Deeply nourishes roots and calms dry, itchy scalp conditions." }
      ]
    },
    howToUse: [
      "Part hair into small sections and apply 4-6 drops directly onto the scalp.",
      "Gently massage with fingertips in circular motions for 5 minutes.",
      "Leave on for at least 2 hours or overnight before washing with a gentle shampoo.",
      "Use 3 times weekly for optimal hair density results."
    ],
    specifications: {
      size: "100ml / 3.38 fl. oz.",
      shelfLife: "24 Months",
      countryOfOrigin: "India",
      form: "Lightweight Oil Base"
    },
    stockQuantity: 42,
    images: [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    reviewsList: [
      { id: "r1", author: "Priya S.", rating: 5, date: "12 Aug 2026", comment: "My hair fall reduced significantly within 3 weeks of regular oiling!", productChip: "100ml Oil", verified: true },
      { id: "r2", author: "Ananya M.", rating: 5, date: "28 Jul 2026", comment: "Doesn't leave my scalp greasy at all. Love the calming rosemary scent.", productChip: "100ml Oil", verified: true }
    ]
  },
  {
    id: "hc-02",
    slug: "keratin-argan-repair-shampoo",
    name: "Keratin & Moroccan Argan Intense Repair Shampoo",
    category: "hair-care",
    concerns: ["dry-hair", "hair-fall"],
    price: 499,
    originalPrice: 650,
    rating: 4.7,
    reviewCount: 218,
    benefitLine: "Restores moisture balance and seals damaged cuticles without sulfates.",
    shortBullets: [
      "100% Sulfate-free gentle cleansing formula",
      "Enriched with pure Moroccan Argan Oil and Hydrolyzed Keratin",
      "Protects color-treated and chemically-processed hair"
    ],
    description: "A gentle sulfate-free cleanser designed to nourish stressed strands. Hydrolyzed Keratin binds to fragile hair cuticles while pure Argan oil restores silky smoothness.",
    expandedBenefits: "Prevents split ends, adds luminous shine, and gently removes environmental buildup without stripping essential scalp moisture.",
    ingredients: {
      inci: "Water (Aqua), Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Hydrolyzed Keratin, Argania Spinosa (Argan) Kernel Oil, Panthenol (Pro-Vitamin B5), Polyquaternium-10, Phenoxyethanol.",
      heroIngredients: [
        { name: "Hydrolyzed Keratin", benefit: "Fills structural gaps in the cuticle layer to rebuild tensile strength." },
        { name: "Moroccan Argan Oil", benefit: "Rich in Vitamin E and fatty acids for luminous shine and humidity resistance." }
      ]
    },
    howToUse: [
      "Apply a generous amount to wet hair and scalp.",
      "Work into a rich lather massaging gently for 1-2 minutes.",
      "Rinse thoroughly with lukewarm water. Follow with repair conditioner."
    ],
    specifications: {
      size: "250ml / 8.45 fl. oz.",
      shelfLife: "24 Months",
      countryOfOrigin: "India",
      form: "Lathering Cream Shampoo"
    },
    stockQuantity: 28,
    images: [
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: false,
    isBestSeller: true,
    reviewsList: [
      { id: "r3", author: "Kavita R.", rating: 5, date: "05 Aug 2026", comment: "Best sulfate-free shampoo I have used. Hair feels so soft!", productChip: "250ml Shampoo", verified: true }
    ]
  },

  // ── SKIN CARE ───────────────────────────────────────────
  {
    id: "sc-01",
    slug: "niacinamide-zinc-barrier-serum",
    name: "10% Niacinamide & 1% Zinc PCA Clarifying Serum",
    category: "skin-care",
    concerns: ["acne-care", "dull-skin", "skin-hydration"],
    price: 649,
    originalPrice: 850,
    rating: 4.9,
    reviewCount: 512,
    benefitLine: "Minimizes open pores, regulates sebum production, and fades dark spots.",
    shortBullets: [
      "High potency 10% Vitamin B3 Niacinamide with Zinc PCA",
      "Fades post-acne blemishes and unifies skin texture",
      "Lightweight water-gel base absorbs instantly without sticky feel"
    ],
    description: "Engineered to transform congested, uneven skin tone. High-purity Niacinamide smooths rough texture and minimizes enlarged pores, while Zinc PCA balances oily shine.",
    expandedBenefits: "Reinforces the epidermal moisture barrier, calms redness, and visibly brightens post-inflammatory hyperpigmentation.",
    ingredients: {
      inci: "Aqua, Niacinamide, Glycerin, Zinc PCA, Hyaluronic Acid, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin, Disodium EDTA.",
      heroIngredients: [
        { name: "10% Niacinamide", benefit: "Inhibits melanosome transfer to lighten blemishes and refine pore structure." },
        { name: "1% Zinc PCA", benefit: "Controls excess sebum secretion and calms active inflammation." }
      ]
    },
    howToUse: [
      "Cleanse face thoroughly and pat skin semi-dry.",
      "Dispense 2-3 drops onto face and gently tap across cheeks, forehead, and chin.",
      "Allow 60 seconds to absorb before applying moisturizer and SPF."
    ],
    specifications: {
      size: "30ml / 1.0 fl. oz.",
      shelfLife: "18 Months",
      countryOfOrigin: "India",
      form: "Fluid Water-Gel"
    },
    stockQuantity: 60,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    reviewsList: [
      { id: "r4", author: "Rohan D.", rating: 5, date: "15 Aug 2026", comment: "My acne marks reduced noticeably within 2 weeks!", productChip: "30ml Bottle", verified: true },
      { id: "r5", author: "Meera K.", rating: 5, date: "01 Aug 2026", comment: "So lightweight under moisturizer. Highly recommended for oily skin.", productChip: "30ml Bottle", verified: true }
    ]
  },
  {
    id: "sc-02",
    slug: "hyaluronic-ceramide-deep-moisturizer",
    name: "Ceramide & 5D Hyaluronic Barrier Cream",
    category: "skin-care",
    concerns: ["skin-hydration", "dull-skin"],
    price: 749,
    originalPrice: 990,
    rating: 4.8,
    reviewCount: 389,
    benefitLine: "Locks in 24-hour hydration and repairs damaged skin moisture barrier.",
    shortBullets: [
      "Complex of 3 essential ceramides (NP, AP, EOP) and 5 molecular weights of Hyaluronic Acid",
      "Restores dry, flakey or compromised moisture barrier",
      "Non-comedogenic cream base suitable for sensitive skin"
    ],
    description: "A restorative barrier cream that mimics the skin's lipid structure. Multi-molecular Hyaluronic Acid hydrates across skin layers while Ceramides lock moisture inside.",
    expandedBenefits: "Eliminates tightness, calms irritation from active ingredients, and restores a radiant, supple, healthy skin bounce.",
    ingredients: {
      inci: "Aqua, Caprylic/Capric Triglyceride, Glycerin, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate Crosspolymer, Phytosphingosine, Cholesterol, Carbomer, Phenoxyethanol.",
      heroIngredients: [
        { name: "3 Essential Ceramides", benefit: "Rebuilds the intercellular lipid matrix to block moisture loss." },
        { name: "5D Hyaluronic Acid", benefit: "Penetrates deep into dermal layers for multi-level plump hydration." }
      ]
    },
    howToUse: [
      "Scoop a dime-sized amount onto clean fingertips.",
      "Smooth evenly over face and neck morning and night after serums.",
      "Gently press into skin until fully absorbed."
    ],
    specifications: {
      size: "50g / 1.76 oz.",
      shelfLife: "24 Months",
      countryOfOrigin: "India",
      form: "Velvety Barrier Cream"
    },
    stockQuantity: 35,
    images: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: true,
    isBestSeller: false,
    reviewsList: [
      { id: "r6", author: "Sneha P.", rating: 5, date: "10 Aug 2026", comment: "Saved my dry skin during dry weather. So creamy yet non-greasy!", productChip: "50g Jar", verified: true }
    ]
  },

  // ── COSMETICS ───────────────────────────────────────────
  {
    id: "co-01",
    slug: "velvet-matte-hyaluronic-lipstick",
    name: "Velvet Matte Moisture-Infused Lipstick",
    category: "cosmetics",
    concerns: ["dull-skin"],
    price: 549,
    originalPrice: 699,
    rating: 4.6,
    reviewCount: 174,
    benefitLine: "Rich, weightless 12-hour matte finish with hydrating Hyaluronic spheres.",
    shortBullets: [
      "One-swipe intense pigment payoff in warm terracotta tone",
      "Infused with Hyaluronic Acid and Vitamin E so lips never feel dry",
      "Smudge-proof, transfer-resistant comfort wear"
    ],
    description: "Experience high-pigment matte color without drying out your lips. Formulated with micro-encapsulated Hyaluronic Acid spheres that hydrate upon application.",
    expandedBenefits: "Glides seamlessly onto lips, blurring fine lines while delivering rich color that stays vibrant all day.",
    ingredients: {
      inci: "Isododecane, Dimethicone, Silica, Polyethylene, Hyaluronic Acid, Tocopheryl Acetate (Vitamin E), Jojoba Seed Oil, CI 77491, CI 77891.",
      heroIngredients: [
        { name: "Hyaluronic Spheres", benefit: "Prevents lip cracking and maintains plump soft feel." },
        { name: "Vitamin E & Jojoba", benefit: "Provides antioxidant barrier and smooth gliding feel." }
      ]
    },
    howToUse: [
      "Start at the center of the upper lip and follow contour outwards.",
      "Glide across bottom lip and press together gently.",
      "Allow 30 seconds to set into a transfer-proof velvety matte finish."
    ],
    specifications: {
      size: "3.8g / 0.13 oz.",
      shelfLife: "36 Months",
      countryOfOrigin: "Italy",
      form: "Bullet Stick"
    },
    stockQuantity: 18,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    reviewsList: [
      { id: "r7", author: "Shalini V.", rating: 5, date: "18 Aug 2026", comment: "The terracotta shade is gorgeous on warm skin tones!", productChip: "Shade: Terracotta Velvet", verified: true }
    ]
  },
  {
    id: "co-02",
    slug: "skin-blur-serum-foundation-spf30",
    name: "Weightless Skin-Blur Serum Foundation SPF 30",
    category: "cosmetics",
    concerns: ["dull-skin", "skin-hydration"],
    price: 899,
    originalPrice: 1149,
    rating: 4.5,
    reviewCount: 208,
    benefitLine: "Buildable medium coverage that blurs pores while shielding skin with SPF 30.",
    shortBullets: [
      "Serum-light texture that never settles into fine lines",
      "Broad spectrum SPF 30 PA+++ daily sun defence",
      "Infused with Niacinamide for visibly brighter skin over time"
    ],
    description: "A skincare-makeup hybrid that evens out tone with a soft-focus finish while treating skin with Niacinamide and Hyaluronic Acid across a 12-hour wear window.",
    expandedBenefits: "Controls midday shine without a cakey mask effect, and the flexible pigment layer stays true to tone without oxidising to an orange cast.",
    ingredients: {
      inci: "Aqua, Cyclopentasiloxane, Titanium Dioxide, Niacinamide, Sodium Hyaluronate, Glycerin, Dimethicone, Tocopheryl Acetate, CI 77492, CI 77491.",
      heroIngredients: [
        { name: "Niacinamide", benefit: "Fades pigmentation and refines enlarged pores with continued use." },
        { name: "Encapsulated SPF 30", benefit: "Shields against UVA/UVB without a heavy white cast." }
      ]
    },
    howToUse: [
      "Shake well and dispense one pump onto the back of the hand.",
      "Dot across forehead, cheeks, nose and chin.",
      "Blend outwards with a damp sponge or dense brush for a seamless finish.",
      "Layer a second thin coat only where extra coverage is needed."
    ],
    specifications: {
      size: "30ml / 1.01 fl. oz.",
      shelfLife: "30 Months",
      countryOfOrigin: "India",
      form: "Pump Bottle Serum"
    },
    stockQuantity: 26,
    images: [
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: false,
    isBestSeller: false,
    reviewsList: [
      { id: "r11", author: "Divya R.", rating: 5, date: "22 Aug 2026", comment: "Feels like nothing on the skin but my pores completely disappear.", productChip: "Shade: Warm Sand", verified: true }
    ]
  },
  {
    id: "co-03",
    slug: "precision-ink-longwear-liquid-eyeliner",
    name: "Precision Ink Longwear Liquid Eyeliner",
    category: "cosmetics",
    concerns: ["dull-skin"],
    price: 449,
    originalPrice: 599,
    rating: 4.7,
    reviewCount: 291,
    benefitLine: "Ultra-fine 0.1mm brush tip delivering intense one-stroke jet black definition.",
    shortBullets: [
      "Flexible felt tip for both hairline flicks and bold graphic wings",
      "Waterproof, smudge-proof and sweat-resistant for 16 hours",
      "Ophthalmologically tested and safe for contact lens wearers"
    ],
    description: "A high-precision liquid liner engineered with a tapered felt applicator that lets you draw everything from a barely-there lash line to a sharp cut wing in a single pass.",
    expandedBenefits: "Fast-drying formula sets in under 15 seconds with zero transfer onto the lid crease, yet removes cleanly with a gentle micellar cleanser.",
    ingredients: {
      inci: "Aqua, Butylene Glycol, Acrylates Copolymer, Panthenol, Phenoxyethanol, CI 77499.",
      heroIngredients: [
        { name: "Flexible Film Polymer", benefit: "Locks pigment in place against humidity, oil and light water contact." },
        { name: "Panthenol", benefit: "Conditions the delicate lash line rather than drying it out." }
      ]
    },
    howToUse: [
      "Shake the pen with the cap on before first use.",
      "Rest the tip at the inner lash line and draw outward in short connected strokes.",
      "Extend past the outer corner and thicken the line to build a wing.",
      "Allow 15 seconds to set fully before opening the eye wide."
    ],
    specifications: {
      size: "1.2ml / 0.04 fl. oz.",
      shelfLife: "24 Months",
      countryOfOrigin: "South Korea",
      form: "Felt Tip Pen"
    },
    stockQuantity: 34,
    images: [
      "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: false,
    isBestSeller: true,
    reviewsList: [
      { id: "r12", author: "Nandini T.", rating: 5, date: "26 Aug 2026", comment: "Survived a full monsoon commute without a single smudge.", productChip: "Shade: Jet Black", verified: true }
    ]
  },
  {
    id: "co-04",
    slug: "lash-lift-volumizing-mascara",
    name: "Lash Lift Volumizing Curl-Hold Mascara",
    category: "cosmetics",
    concerns: ["dull-skin"],
    price: 649,
    originalPrice: 849,
    rating: 4.6,
    reviewCount: 163,
    benefitLine: "Builds 4x visible volume with a 24-hour curl that refuses to drop.",
    shortBullets: [
      "Hourglass fibre brush separates and coats every single lash",
      "Peptide and Biotin complex strengthens lashes with continued wear",
      "Flake-free, clump-free formula that removes with warm water"
    ],
    description: "A buildable volumising mascara with a shape-memory polymer that locks lashes into a lifted curl from morning to midnight, while peptides condition the lash line underneath.",
    expandedBenefits: "The tapered fibre bristles reach even inner-corner lashes, layering easily from a natural daytime separation to a full dramatic fan without weighing lashes down.",
    ingredients: {
      inci: "Aqua, Synthetic Beeswax, Copernicia Cerifera (Carnauba) Wax, Biotin, Panthenol, Acacia Senegal Gum, Palmitoyl Tripeptide-1, CI 77499.",
      heroIngredients: [
        { name: "Shape-Memory Polymer", benefit: "Holds the lash curl in place for a full 24 hours without drooping." },
        { name: "Peptide & Biotin Complex", benefit: "Nourishes lashes to reduce breakage from daily makeup wear." }
      ]
    },
    howToUse: [
      "Wipe excess formula on the tube rim before application.",
      "Start at the lash root and wiggle the brush upward through the tips.",
      "Apply a second coat while the first is still tacky to build volume.",
      "Remove with warm water and gentle pressure — no harsh rubbing needed."
    ],
    specifications: {
      size: "9ml / 0.30 fl. oz.",
      shelfLife: "24 Months",
      countryOfOrigin: "India",
      form: "Tube with Fibre Brush"
    },
    stockQuantity: 22,
    images: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: true,
    isBestSeller: false,
    reviewsList: [
      { id: "r13", author: "Aishwarya B.", rating: 5, date: "30 Aug 2026", comment: "My lashes stayed curled all day and washing it off is so easy.", productChip: "9ml Tube", verified: true }
    ]
  },

  // ── HEALTH CARE ─────────────────────────────────────────
  {
    id: "hc-03",
    slug: "infrared-non-contact-digital-thermometer",
    name: "Medical Grade Non-Contact Infrared Thermometer",
    category: "health-care",
    concerns: ["daily-wellness"],
    price: 1299,
    originalPrice: 1999,
    rating: 4.9,
    reviewCount: 450,
    benefitLine: "Instant 1-second accurate temperature readouts with color LCD fever warning.",
    shortBullets: [
      "German high-precision infrared sensor technology",
      "Dual mode measurement for forehead temperature & surface objects",
      "32-reading memory storage with silent fever alarm option"
    ],
    description: "Essential family health monitoring device. Clinically validated non-contact sensor provides instant temperature measurements from 1-5 cm distance.",
    expandedBenefits: "Hygienic, zero-contact design prevents cross contamination between family members. Clear color-coded backlit display (Green/Yellow/Red).",
    ingredients: {
      inci: "Medical grade ABS enclosure, German thermopile sensor, LCD display board, CE & ISO 13485 certified.",
      heroIngredients: [
        { name: "Infrared Sensor", benefit: "Delivers ±0.2°C accuracy in less than 1 second." }
      ]
    },
    howToUse: [
      "Aim sensor at forehead center from 1-3 cm distance.",
      "Press measure button and hold for 1 second until beep sounds.",
      "Read temperature value on backlit screen."
    ],
    specifications: {
      size: "1 Unit (Includes 2x AAA batteries)",
      shelfLife: "5 Year Warranty",
      countryOfOrigin: "Germany",
      form: "Handheld Device"
    },
    stockQuantity: 15,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: false,
    isBestSeller: true,
    reviewsList: [
      { id: "r8", author: "Dr. Rajesh K.", rating: 5, date: "02 Aug 2026", comment: "Very accurate readings. Extremely handy for quick fever monitoring.", productChip: "Digital Unit", verified: true }
    ]
  },

  // ── WELLNESS ────────────────────────────────────────────
  {
    id: "wl-01",
    slug: "ashwagandha-melatonin-sleep-ritual-gummies",
    name: "Deep Rest Melatonin & KSM-66 Ashwagandha Gummies",
    category: "wellness",
    concerns: ["daily-wellness"],
    price: 699,
    originalPrice: 899,
    rating: 4.8,
    reviewCount: 290,
    benefitLine: "Promotes fast restful sleep, calms nighttime stress, and refreshes energy.",
    shortBullets: [
      "5mg Melatonin paired with patented KSM-66 Ashwagandha extract",
      "Non-habit forming, vegan pectin gummies with natural berry flavor",
      "Zero added refined sugar or artificial gelatin"
    ],
    description: "Designed for daily evening bedtime rituals. Combines circadian-regulating Melatonin with clinically studied KSM-66 Ashwagandha to ease racing thoughts.",
    expandedBenefits: "Helps you fall asleep naturally in 30 minutes and wake up refreshed without morning grogginess.",
    ingredients: {
      inci: "KSM-66 Ashwagandha Root Extract (300mg), Melatonin (5mg), L-Theanine (100mg), Chamomile Flower Extract, Passionflower, Pectin, Natural Berry Extract.",
      heroIngredients: [
        { name: "KSM-66 Ashwagandha", benefit: "Reduces cortisol stress levels for natural nervous system relaxation." },
        { name: "Melatonin & L-Theanine", benefit: "Regulates natural sleep cycle and encourages deep REM sleep." }
      ]
    },
    howToUse: [
      "Chew 1 gummy 30 minutes before intended bedtime.",
      "Dim room lighting and disconnect from electronic screens.",
      "Use consistently for bedtime routine building."
    ],
    specifications: {
      size: "60 Vegan Gummies (30 Day Supply)",
      shelfLife: "18 Months",
      countryOfOrigin: "India",
      form: "Chewable Pectin Gummy"
    },
    stockQuantity: 50,
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    reviewsList: [
      { id: "r9", author: "Siddharth N.", rating: 5, date: "11 Aug 2026", comment: "I fall asleep so easily now without feeling tired the next morning!", productChip: "60 Gummies Jar", verified: true }
    ]
  },
  {
    id: "wl-02",
    slug: "marine-collagen-vitamin-c-peptides",
    name: "Pure Marine Collagen Peptides + Vitamin C Powder",
    category: "wellness",
    concerns: ["dull-skin", "skin-hydration", "daily-wellness"],
    price: 1199,
    originalPrice: 1499,
    rating: 4.9,
    reviewCount: 310,
    benefitLine: "Boosts skin elasticity, reduces fine wrinkles, and strengthens hair & nails.",
    shortBullets: [
      "100% Wild-caught Hydrolyzed Type I Marine Collagen (10,000mg per scoop)",
      "Enhanced with Vitamin C & Hyaluronic Acid for optimal collagen synthesis",
      "Unflavored, zero fishy odor — dissolves instantly in morning tea, coffee or smoothie"
    ],
    description: "Revitalize your skin elasticity and joint health from within. Hydrolyzed collagen peptides feature high bioavailability for rapid tissue absorption.",
    expandedBenefits: "Smooths fine lines, improves skin firmness, and strengthens brittle nails within 4-6 weeks of daily consumption.",
    ingredients: {
      inci: "Hydrolyzed Marine Collagen Peptides (Fish origin), L-Ascorbic Acid (Vitamin C), Hyaluronic Acid, Zinc Sulfate.",
      heroIngredients: [
        { name: "Hydrolyzed Marine Collagen", benefit: "Low molecular weight peptides rebuild dermal collagen density." },
        { name: "Vitamin C & Hyaluronic Acid", benefit: "Essential co-factors that lock skin moisture and trigger collagen synthesis." }
      ]
    },
    howToUse: [
      "Mix 1 scoop (10g) into warm or cold beverages.",
      "Stir well for 15 seconds until clear.",
      "Consume daily in the morning on an empty stomach."
    ],
    specifications: {
      size: "250g Powder Jar (25 Servings)",
      shelfLife: "24 Months",
      countryOfOrigin: "Norway / India",
      form: "Soluble Unflavored Powder"
    },
    stockQuantity: 24,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
    ],
    isFeatured: true,
    isBestSeller: false,
    reviewsList: [
      { id: "r10", author: "Pooja G.", rating: 5, date: "09 Aug 2026", comment: "My skin glows and feels much firmer after 1 month!", productChip: "250g Powder", verified: true }
    ]
  }
];

export function getAllProducts() {
  return PRODUCTS;
}

// The Supabase `products` table only carries the fields the admin dashboard
// edits (name/price/stock/images/...). For the original catalog, this restores
// the richer PDP content — INCI, how-to-use, reviews — from the matching local
// record, while live DB fields (price, stock, images) still win.
export function mergeWithCatalogDetails(product) {
  if (!product) return product;
  const match = PRODUCTS.find(p => p.id === product.id || p.slug === product.slug);
  return match ? { ...match, ...product } : product;
}

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

export function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug || p.id === slug) || null;
}

export function getProductsByCategory(catId) {
  if (!catId || catId === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === catId);
}

export function getProductsByConcern(concernTag) {
  if (!concernTag) return PRODUCTS;
  return PRODUCTS.filter(p => p.concerns && p.concerns.includes(concernTag));
}

export function getFeaturedProducts() {
  return PRODUCTS.filter(p => p.isFeatured);
}

export function getBestSellers() {
  return PRODUCTS.filter(p => p.isBestSeller);
}

export function getCategories() {
  return CATEGORIES;
}

export function getConcerns() {
  return CONCERNS;
}

export function searchProducts(query = '', category = '', concern = '') {
  let list = PRODUCTS.slice();
  const term = query.trim().toLowerCase();
  
  if (term) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.benefitLine.toLowerCase().includes(term) ||
      (p.concerns && p.concerns.some(c => c.toLowerCase().includes(term)))
    );
  }
  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }
  if (concern) {
    list = list.filter(p => p.concerns && p.concerns.includes(concern));
  }
  return list;
}

export function formatPrice(price) {
  return '₹' + price.toLocaleString('en-IN');
}

export default PRODUCTS;
