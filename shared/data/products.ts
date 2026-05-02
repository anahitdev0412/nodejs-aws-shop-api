import { Product, ProductCategory } from "../types/product";

export const PRODUCTS: Product[] = [
  {
    id: "prod-001",
    productName: "Sony WH-1000XM5 Wireless Headphones",
    description:
      "Industry-leading noise canceling with Auto NC Optimizer. Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback). Crystal clear hands-free calling. Multipoint connection – connect to two Bluetooth devices simultaneously.",
    price: 349.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: ProductCategory.ELECTRONICS,
    stock: 45,
    rating: 4.8,
    tags: ["headphones", "wireless", "noise-canceling", "sony", "audio"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-11-20T14:30:00Z",
  },
  {
    id: "prod-002",
    productName: "Apple MacBook Pro 14-inch M4",
    description:
      "Supercharged by M4 chip. Stunning Liquid Retina XDR display. Up to 24 hours battery life. 16GB unified memory, 512GB SSD storage. Features MagSafe charging, Thunderbolt 4, and HDMI ports.",
    price: 1999.0,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    category: ProductCategory.ELECTRONICS,
    stock: 12,
    rating: 4.9,
    tags: ["laptop", "apple", "macbook", "m4", "professional"],
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "prod-003",
    productName: "Nike Air Max 270 React",
    description:
      "The Nike Air Max 270 React combines two of our most innovative cushioning technologies for an incredibly smooth ride. The React foam provides soft, springy cushioning, while the large Air unit delivers maximum comfort.",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: ProductCategory.CLOTHING,
    stock: 78,
    rating: 4.5,
    tags: ["shoes", "nike", "running", "air-max", "sneakers"],
    createdAt: "2024-02-10T11:00:00Z",
    updatedAt: "2024-10-15T09:00:00Z",
  },
  {
    id: "prod-004",
    productName: "The Pragmatic Programmer 20th Anniversary Edition",
    description:
      "One of the most influential books in software development. Updated for modern development practices, this anniversary edition includes new sections on career development, concurrency, and more.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    category: ProductCategory.BOOKS,
    stock: 200,
    rating: 4.7,
    tags: ["programming", "software-development", "career", "technical"],
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-09-01T12:00:00Z",
  },
  {
    id: "prod-005",
    productName: "Dyson V15 Detect Absolute",
    description:
      "Laser technology detects invisible dust. LCD screen displays particle counts scientifically and adapts suction to surface. The most powerful Dyson cordless vacuum. HEPA filtration captures 99.99% of microscopic particles.",
    price: 749.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    category: ProductCategory.HOME,
    stock: 23,
    rating: 4.6,
    tags: ["vacuum", "dyson", "cordless", "home-appliance", "cleaning"],
    createdAt: "2024-04-20T14:00:00Z",
    updatedAt: "2024-11-10T11:00:00Z",
  },
  {
    id: "prod-006",
    productName: "Peloton Bike+ Indoor Cycling Bike",
    description:
      "Experience immersive live and on-demand fitness classes. Auto-Follow technology adjusts your resistance automatically. Rotating 24-inch HD touchscreen. Apple GymKit compatible. Built-in speakers and microphone.",
    price: 2495.0,
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400",
    category: ProductCategory.SPORTS,
    stock: 8,
    rating: 4.4,
    tags: ["cycling", "fitness", "peloton", "indoor", "workout"],
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-12-05T16:00:00Z",
  },
  {
    id: "prod-007",
    productName: "Nespresso Vertuo Next Coffee Machine",
    description:
      "Brew 5 cup sizes: Espresso, Double Espresso, Gran Lungo, Coffee, and Alto. Centrifusion™ technology for perfect crema. Bluetooth and Wi-Fi connectivity. Compact design fits any kitchen countertop.",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    category: ProductCategory.FOOD,
    stock: 56,
    rating: 4.3,
    tags: ["coffee", "nespresso", "kitchen", "espresso", "home"],
    createdAt: "2024-06-15T09:00:00Z",
    updatedAt: "2024-11-25T13:00:00Z",
  },
  {
    id: "prod-008",
    productName: "Samsung 65-inch OLED 4K Smart TV",
    description:
      "Self-lit pixels for perfect blacks and infinite contrast. Neural Quantum Processor 4K powered by AI. Object Tracking Sound+ with Dolby Atmos. Gaming Hub with cloud gaming. Sleek One Connect Box design.",
    price: 2299.99,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
    category: ProductCategory.ELECTRONICS,
    stock: 15,
    rating: 4.8,
    tags: ["tv", "samsung", "oled", "4k", "smart-tv"],
    createdAt: "2024-02-28T10:00:00Z",
    updatedAt: "2024-12-10T08:00:00Z",
  },
];

export function findProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
