/**
 * Local dummy data for Demo Mode.
 *
 * Field names mirror Vendre Surface v2 product/category payloads (id, name,
 * slug, prices with/without VAT) so switching to live data is a swap of the
 * data layer, not a rewrite of the UI.
 *
 * This data is never sent to Vendre — Demo Mode is fully decoupled.
 */
import heroLiving from "@/assets/hero-living.jpg";
import productLamp from "@/assets/product-lamp.jpg";
import productMug from "@/assets/product-mug.jpg";
import productThrow from "@/assets/product-throw.jpg";

export type DemoCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  children: { id: string; name: string; slug: string }[];
};

export type DemoVariant = {
  id: string;
  name: string;
  inStock: boolean;
};

export type DemoProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  priceIncVat: number;
  comparePriceIncVat?: number;
  vatRate: number;
  currency: string;
  images: string[];
  variants: DemoVariant[];
  badge?: string;
  featured?: boolean;
};

export const demoStore = {
  name: "Nordiska Hemmet",
  currency: "SEK",
  locale: "sv-SE",
  pricesIncludeVat: true,
  heroImage: heroLiving,
};

export const demoCategories: DemoCategory[] = [
  {
    id: "cat-belysning",
    name: "Belysning",
    slug: "belysning",
    description: "Lampor och armaturer som ger rummet rätt ljus dygnet runt.",
    children: [
      { id: "sub-bordslampor", name: "Bordslampor", slug: "bordslampor" },
      { id: "sub-golvlampor", name: "Golvlampor", slug: "golvlampor" },
      { id: "sub-taklampor", name: "Taklampor", slug: "taklampor" },
    ],
  },
  {
    id: "cat-textil",
    name: "Textil",
    slug: "textil",
    description: "Filtar, kuddar och mattor i naturmaterial.",
    children: [
      { id: "sub-filtar", name: "Filtar", slug: "filtar" },
      { id: "sub-kuddar", name: "Kuddar", slug: "kuddar" },
      { id: "sub-mattor", name: "Mattor", slug: "mattor" },
    ],
  },
  {
    id: "cat-kok",
    name: "Kök & servering",
    slug: "kok-och-servering",
    description: "Keramik och redskap tillverkade för vardagsbruk.",
    children: [
      { id: "sub-muggar", name: "Muggar", slug: "muggar" },
      { id: "sub-skalar", name: "Skålar", slug: "skalar" },
      { id: "sub-servering", name: "Servering", slug: "servering" },
    ],
  },
  {
    id: "cat-mobler",
    name: "Möbler",
    slug: "mobler",
    description: "Massiv ek och lugna former för hela hemmet.",
    children: [
      { id: "sub-bord", name: "Bord", slug: "bord" },
      { id: "sub-forvaring", name: "Förvaring", slug: "forvaring" },
    ],
  },
  {
    id: "cat-inredning",
    name: "Inredning",
    slug: "inredning",
    description: "Detaljerna som gör rummet färdigt.",
    children: [
      { id: "sub-vaser", name: "Vaser", slug: "vaser" },
      { id: "sub-ljus", name: "Ljus & doft", slug: "ljus-och-doft" },
    ],
  },
];

const sizeVariants: DemoVariant[] = [
  { id: "v-small", name: "Liten", inStock: true },
  { id: "v-medium", name: "Mellan", inStock: true },
  { id: "v-large", name: "Stor", inStock: false },
];

const colorVariants: DemoVariant[] = [
  { id: "v-sand", name: "Sand", inStock: true },
  { id: "v-grafit", name: "Grafit", inStock: true },
  { id: "v-lera", name: "Lera", inStock: true },
];

export const demoProducts: DemoProduct[] = [
  {
    id: "p-1001",
    name: "Bordslampa Ljus",
    slug: "bordslampa-ljus",
    categoryId: "cat-belysning",
    subcategoryId: "sub-bordslampor",
    description:
      "Mattsvart bordslampa med skärm i tvättat lin. Ger ett varmt, mjukt sken och passar lika bra i sovrummet som på skrivbordet.",
    priceIncVat: 1495,
    comparePriceIncVat: 1795,
    vatRate: 25,
    currency: "SEK",
    images: [productLamp, heroLiving],
    variants: colorVariants,
    badge: "Kampanj",
    featured: true,
  },
  {
    id: "p-1002",
    name: "Golvlampa Skog",
    slug: "golvlampa-skog",
    categoryId: "cat-belysning",
    subcategoryId: "sub-golvlampor",
    description: "Smal golvlampa i pulverlackad metall med justerbar arm.",
    priceIncVat: 2395,
    vatRate: 25,
    currency: "SEK",
    images: [productLamp],
    variants: colorVariants,
  },
  {
    id: "p-1003",
    name: "Taklampa Cirkel",
    slug: "taklampa-cirkel",
    categoryId: "cat-belysning",
    subcategoryId: "sub-taklampor",
    description: "Rund taklampa i borstad aluminium med dimbar LED.",
    priceIncVat: 1890,
    vatRate: 25,
    currency: "SEK",
    images: [productLamp],
    variants: sizeVariants,
  },
  {
    id: "p-1004",
    name: "Läslampa Vinkel",
    slug: "laslampa-vinkel",
    categoryId: "cat-belysning",
    subcategoryId: "sub-bordslampor",
    description: "Kompakt läslampa med riktbart huvud och textilklädd sladd.",
    priceIncVat: 995,
    vatRate: 25,
    currency: "SEK",
    images: [productLamp],
    variants: colorVariants,
  },
  {
    id: "p-2001",
    name: "Ullfilt Grov",
    slug: "ullfilt-grov",
    categoryId: "cat-textil",
    subcategoryId: "sub-filtar",
    description:
      "Tjock, grovstickad filt i 100 % lammull. Tillverkad i Norden och tvättas på ullprogram.",
    priceIncVat: 1290,
    comparePriceIncVat: 1490,
    vatRate: 25,
    currency: "SEK",
    images: [productThrow, heroLiving],
    variants: colorVariants,
    badge: "Bästsäljare",
    featured: true,
  },
  {
    id: "p-2002",
    name: "Pläd Fin",
    slug: "plad-fin",
    categoryId: "cat-textil",
    subcategoryId: "sub-filtar",
    description: "Lätt pläd i bomull och lin, perfekt för sommarkvällar.",
    priceIncVat: 749,
    vatRate: 25,
    currency: "SEK",
    images: [productThrow],
    variants: colorVariants,
  },
  {
    id: "p-2003",
    name: "Kuddfodral Lin",
    slug: "kuddfodral-lin",
    categoryId: "cat-textil",
    subcategoryId: "sub-kuddar",
    description: "Tvättat lin med dold dragkedja. Finns i tre storlekar.",
    priceIncVat: 349,
    vatRate: 25,
    currency: "SEK",
    images: [productThrow],
    variants: sizeVariants,
  },
  {
    id: "p-2004",
    name: "Jutematta Vävd",
    slug: "jutematta-vavd",
    categoryId: "cat-textil",
    subcategoryId: "sub-mattor",
    description: "Handvävd jutematta med naturlig lyster och tåligt slitage.",
    priceIncVat: 2790,
    vatRate: 25,
    currency: "SEK",
    images: [heroLiving],
    variants: sizeVariants,
    featured: true,
  },
  {
    id: "p-3001",
    name: "Mugg Stengods",
    slug: "mugg-stengods",
    categoryId: "cat-kok",
    subcategoryId: "sub-muggar",
    description:
      "Drejad mugg i stengods med reaktiv glasyr. Tål maskindisk och mikro, och varje exemplar får sin egen nyans.",
    priceIncVat: 229,
    vatRate: 25,
    currency: "SEK",
    images: [productMug, heroLiving],
    variants: colorVariants,
    featured: true,
  },
  {
    id: "p-3002",
    name: "Espressokopp Liten",
    slug: "espressokopp-liten",
    categoryId: "cat-kok",
    subcategoryId: "sub-muggar",
    description: "Liten kopp för espresso, säljs styckvis.",
    priceIncVat: 169,
    vatRate: 25,
    currency: "SEK",
    images: [productMug],
    variants: colorVariants,
  },
  {
    id: "p-3003",
    name: "Serveringsskål Djup",
    slug: "serveringsskal-djup",
    categoryId: "cat-kok",
    subcategoryId: "sub-skalar",
    description: "Djup skål för sallad och pasta, rymmer tre liter.",
    priceIncVat: 549,
    comparePriceIncVat: 649,
    vatRate: 25,
    currency: "SEK",
    images: [productMug],
    variants: sizeVariants,
    badge: "Kampanj",
  },
  {
    id: "p-3004",
    name: "Serveringsfat Ek",
    slug: "serveringsfat-ek",
    categoryId: "cat-kok",
    subcategoryId: "sub-servering",
    description: "Oljat serveringsfat i massiv ek med fasad kant.",
    priceIncVat: 695,
    vatRate: 25,
    currency: "SEK",
    images: [productMug],
    variants: sizeVariants,
  },
  {
    id: "p-3005",
    name: "Kanna Matt",
    slug: "kanna-matt",
    categoryId: "cat-kok",
    subcategoryId: "sub-servering",
    description: "Kanna i matt stengods med generöst handtag, 1,2 liter.",
    priceIncVat: 495,
    vatRate: 25,
    currency: "SEK",
    images: [productMug],
    variants: colorVariants,
  },
  {
    id: "p-4001",
    name: "Soffbord Ek",
    slug: "soffbord-ek",
    categoryId: "cat-mobler",
    subcategoryId: "sub-bord",
    description:
      "Soffbord i massiv, oljad ek med koniska ben. Levereras omonterat med all beslag som behövs.",
    priceIncVat: 5990,
    comparePriceIncVat: 6990,
    vatRate: 25,
    currency: "SEK",
    images: [heroLiving],
    variants: sizeVariants,
    badge: "Kampanj",
    featured: true,
  },
  {
    id: "p-4002",
    name: "Sidobord Rund",
    slug: "sidobord-rund",
    categoryId: "cat-mobler",
    subcategoryId: "sub-bord",
    description: "Litet runt sidobord i ek, höjd 52 cm.",
    priceIncVat: 2290,
    vatRate: 25,
    currency: "SEK",
    images: [heroLiving],
    variants: colorVariants,
  },
  {
    id: "p-4003",
    name: "Skänk Låg",
    slug: "skank-lag",
    categoryId: "cat-mobler",
    subcategoryId: "sub-forvaring",
    description: "Låg skänk med två dörrar och justerbar hyllplan.",
    priceIncVat: 8990,
    vatRate: 25,
    currency: "SEK",
    images: [heroLiving],
    variants: sizeVariants,
  },
  {
    id: "p-4004",
    name: "Korg Flätad",
    slug: "korg-flatad",
    categoryId: "cat-mobler",
    subcategoryId: "sub-forvaring",
    description: "Flätad förvaringskorg i sjögräs med förstärkta handtag.",
    priceIncVat: 599,
    vatRate: 25,
    currency: "SEK",
    images: [heroLiving],
    variants: sizeVariants,
  },
  {
    id: "p-5001",
    name: "Vas Bukig",
    slug: "vas-bukig",
    categoryId: "cat-inredning",
    subcategoryId: "sub-vaser",
    description: "Bukig vas i matt keramik, höjd 24 cm.",
    priceIncVat: 449,
    vatRate: 25,
    currency: "SEK",
    images: [productMug],
    variants: colorVariants,
    featured: true,
  },
  {
    id: "p-5002",
    name: "Doftljus Ceder",
    slug: "doftljus-ceder",
    categoryId: "cat-inredning",
    subcategoryId: "sub-ljus-och-doft",
    description: "Doftljus av rapsvax med toner av ceder och vetiver, 45 h.",
    priceIncVat: 329,
    vatRate: 25,
    currency: "SEK",
    images: [productMug],
    variants: sizeVariants,
  },
  {
    id: "p-5003",
    name: "Ljusstake Låg",
    slug: "ljusstake-lag",
    categoryId: "cat-inredning",
    subcategoryId: "sub-ljus-och-doft",
    description: "Låg ljusstake i sandblästrat glas för kronljus.",
    priceIncVat: 249,
    vatRate: 25,
    currency: "SEK",
    images: [productMug],
    variants: colorVariants,
  },
];

export const demoFooterColumns = [
  {
    title: "Kundservice",
    links: ["Kontakta oss", "Frakt och leverans", "Returer och byten", "Vanliga frågor"],
  },
  {
    title: "Om oss",
    links: ["Vår historia", "Hållbarhet", "Butiker", "Jobba hos oss"],
  },
  {
    title: "Betalsätt",
    links: ["Faktura", "Kortbetalning", "Swish", "Delbetalning"],
  },
  {
    title: "Följ oss",
    links: ["Nyhetsbrev", "Instagram", "Pinterest", "Facebook"],
  },
];
