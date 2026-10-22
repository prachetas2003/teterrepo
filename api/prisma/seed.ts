import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const pieces = [
  {
    id: "01",
    name: "The breakfast bowl",
    form: "bowl",
    clay: "Speckled stoneware",
    glaze: "Oat ash",
    price: 420,
    color: "#b6a88e",
    note: "A generous bowl for slow mornings. The ash settled in a pale ring around the foot.",
    firing: "Reduction · 1,260°C",
  },
  {
    id: "02",
    name: "The courtyard cup",
    form: "cup",
    clay: "Iron-rich stoneware",
    glaze: "Moss green",
    price: 280,
    color: "#52634d",
    note: "A small cup that sits quietly in the hand. Darker glaze gathers just beneath the lip.",
    firing: "Reduction · 1,260°C",
  },
  {
    id: "03",
    name: "The stem vase",
    form: "vase",
    clay: "White stoneware",
    glaze: "Chalk",
    price: 680,
    color: "#d1c9b6",
    note: "For a single branch, or nothing at all. A soft chalk surface catches the afternoon light.",
    firing: "Reduction · 1,260°C",
  },
  {
    id: "04",
    name: "The evening lamp",
    form: "lamp",
    clay: "Coarse stoneware",
    glaze: "Burnt umber",
    price: 1850,
    color: "#705143",
    note: "A little warmth for the darker months. The clay is left bare beneath the shoulder.",
    firing: "Reduction · 1,260°C",
  },
  {
    id: "05",
    name: "The sharing bowl",
    form: "bowl",
    clay: "Red stoneware",
    glaze: "Iron satin",
    price: 760,
    color: "#995f46",
    note: "Made for the middle of the table. Iron blooms through the glaze at the rim.",
    firing: "Reduction · 1,260°C",
  },
  {
    id: "06",
    name: "The long coffee",
    form: "cup",
    clay: "White stoneware",
    glaze: "Sea salt",
    price: 320,
    color: "#aab5aa",
    note: "Tall enough for a second pour. A quiet green tint appears where the glaze pools.",
    firing: "Reduction · 1,260°C",
  },
  {
    id: "07",
    name: "The gathered vase",
    form: "vase",
    clay: "Speckled stoneware",
    glaze: "Olive ash",
    price: 940,
    color: "#75785a",
    note: "A wide shoulder for garden cuttings. Tiny flecks of iron break the olive surface.",
    firing: "Reduction · 1,260°C",
  },
  {
    id: "08",
    name: "The little dish",
    form: "bowl",
    clay: "White stoneware",
    glaze: "Butter",
    price: 240,
    color: "#c5ae7a",
    note: "For olives, a ring, the last spoonful. Each shallow dish finds its own uneven edge.",
    firing: "Reduction · 1,260°C",
  },
];
try {
  for (const piece of pieces)
    await db.piece.upsert({
      where: { id: piece.id },
      create: piece,
      update: {},
    });
} finally {
  await db.$disconnect();
}
