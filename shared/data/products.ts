import { Product } from "../types/product";

export const PRODUCTS: Product[] = [
  {
    id: "prod-001",
    title: "Sony WH-1000XM5 Wireless Headphones",
    description:
      "Industry-leading noise canceling with Auto NC Optimizer. Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback). Crystal clear hands-free calling. Multipoint connection – connect to two Bluetooth devices simultaneously.",
    price: 349.99,
  },
  {
    id: "prod-002",
    title: "Apple MacBook Pro 14-inch M4",
    description:
      "Supercharged by M4 chip. Stunning Liquid Retina XDR display. Up to 24 hours battery life. 16GB unified memory, 512GB SSD storage. Features MagSafe charging, Thunderbolt 4, and HDMI ports.",
    price: 1999.0,
  },
  {
    id: "prod-003",
    title: "Nike Air Max 270 React",
    description:
      "The Nike Air Max 270 React combines two of our most innovative cushioning technologies for an incredibly smooth ride. The React foam provides soft, springy cushioning, while the large Air unit delivers maximum comfort.",
    price: 159.99,
  },
  {
    id: "prod-004",
    title: "The Pragmatic Programmer 20th Anniversary Edition",
    description:
      "One of the most influential books in software development. Updated for modern development practices, this anniversary edition includes new sections on career development, concurrency, and more.",
    price: 49.99,
  },
  {
    id: "prod-005",
    title: "Dyson V15 Detect Absolute",
    description:
      "Laser technology detects invisible dust. LCD screen displays particle counts scientifically and adapts suction to surface. The most powerful Dyson cordless vacuum. HEPA filtration captures 99.99% of microscopic particles.",
    price: 749.99,
  },
  {
    id: "prod-006",
    title: "Peloton Bike+ Indoor Cycling Bike",
    description:
      "Experience immersive live and on-demand fitness classes. Auto-Follow technology adjusts your resistance automatically. Rotating 24-inch HD touchscreen. Apple GymKit compatible. Built-in speakers and microphone.",
    price: 2495.0,
  },
  {
    id: "prod-007",
    title: "Nespresso Vertuo Next Coffee Machine",
    description:
      "Brew 5 cup sizes: Espresso, Double Espresso, Gran Lungo, Coffee, and Alto. Centrifusion™ technology for perfect crema. Bluetooth and Wi-Fi connectivity. Compact design fits any kitchen countertop.",
    price: 179.99,
  },
  {
    id: "prod-008",
    title: "Samsung 65-inch OLED 4K Smart TV",
    description:
      "Self-lit pixels for perfect blacks and infinite contrast. Neural Quantum Processor 4K powered by AI. Object Tracking Sound+ with Dolby Atmos. Gaming Hub with cloud gaming. Sleek One Connect Box design.",
    price: 2299.99,
  },
];

export function findProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
