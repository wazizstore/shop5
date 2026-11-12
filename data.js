/*
  WAZIZ SHOP – Shared Product Data
  
  Product schema:
  ─────────────────
  id            : unique number
  name          : string
  price         : string (درهم)
  originalPrice : string
  description   : string
  images        : array of image paths
  
  // Variant fields — only include if this product has them:
  colors        : array of { name, class, inStock } OR empty array []
  sizes         : array of strings OR empty array []
  
  // Size guide — only include if meaningful for this product:
  showSizeGuide : boolean (default false)
  
  // If both colors and sizes are empty, product is treated as a fixed/no-variant item.
*/

export const products = [
    {
    id: 23,
    name: "انسومبل polo",
    price: "219",
    originalPrice: "249",
    description: "قلب قيس عاد خلص • التوصيل لجميع مدن المغرب",
images: [
    "mmmm.webp",
    "mmmmm.webp"
],


     colors: [
      { name: "ازرق", class: "blue", inStock: true },
       { name: "اسود", class: "black", inStock: true }
     
    ],
    sizes: ["M", "L", "XL"],
    showSizeGuide: true,
    inStock: true
  },
  {
    id: 23,
    name: "ensemble polo",
    price: "199",
    originalPrice: "230",
    description: "طقم رجالي فاخر 😎 ✔️ مريح ✔️ جودة عالية ✔️ مناسب للصيف",
    images: [
    "123.webp",
    "1234.webp",
    "12345.webp"
 
],
     colors: [
      { name: "أسود", class: "black", inStock: true },
      { name: "أخضر", class: "green", inStock: true }
    ],
    sizes: ["M", "L", "XL"],
    showSizeGuide: true,
    inStock: false
  },

  {
  id: 22,                          // رقم فريد، لا يتكرر
  name: "pack 7 x 1",
  price: "249",
  originalPrice: "300",
  description: "باك رجالي متكامل 7 قطع 👑👑 شنو كيتضمن الباك؟ 3 عطور + مزيل عرق + سماعات بلوتوث + صمطة + بزطام ✅ 3 ريحات مختلفة (عطور) باش تبدل اللوك ديالك كل نهار حسب المزاج ديالك ✅ مزيل عرق حماية فعالة ضد الروائح الكريهة وانتعاش يدوم طويلاً ✅ صمطة أنيقة عملية وخفيفة تقدر تاخذها معاك فين ما مشيتي ✅ بزطام (محفظة أنيقة) تنظيم مثالي للفلوس والكارتات ديالك 💼 ✅ سماعات بلوتوث جودة صوت عالية وتجربة استماع مريحة (AirPods) 🎧",
images: [
    "photo_2026-06-23_13-58-48.webp",
    "photo_2026-06-21_14-50-22.webp",
    "photo_2026-06-21_14-50-27.webp",
    "photo_2026-06-21_14-50-32.webp",
    "photo_2026-06-21_14-50-36.webp",
    "photo_2026-06-21_14-50-42.webp",
    "photo_2026-06-21_14-50-47.webp",
    "photo_2026-06-21_14-50-51.webp",
    "photo_2026-06-21_14-50-18.webp"
]
,
  colors: [],          // فارغة = لا يظهر قسم اللون
  sizes: [],           // فارغة = لا يظهر قسم المقاس
  showSizeGuide: false,
  inStock: true
},


  {
    id: 20,
    name: "Ensemble nike",
    price: "199",
    originalPrice: "249",
    description: "طقم رياضي نايكي أنيق ومريح، مناسب للاستعمال اليومي والرياضة.",
    images: [
      "Untitled design (100).webp",
      "Untitled design (99).webp"
    ],
    colors: [
      { name: "أسود", class: "black", inStock: true },
      { name: "أخضر", class: "green", inStock: true }
    ],
    sizes: ["M", "L", "XL"],
    showSizeGuide: true,
    inStock: true
  },
];
