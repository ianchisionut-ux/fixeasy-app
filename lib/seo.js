import { stripDiacritics } from "./geo";

// Meseriile suportate, cu slug-ul lor pentru URL, etichete afisate,
// si sub-serviciile tipice (folosite ca sugestii rapide in dashboard
// cand un prestator isi adauga serviciile oferite).
export const CATEGORIES_SEO = [
  {
    category: "Instalații Sanitare și Desfundări",
    slug: "instalatii-sanitare",
    label: "Instalații sanitare",
    singular: "instalator sanitar",
    subcategories: ["Instalator sanitar", "Desfundări canalizări și țevi", "Reparații avarii și țevi sparte"],
  },
  {
    category: "Instalații Electrice",
    slug: "instalatii-electrice",
    label: "Instalații electrice",
    singular: "electrician",
    subcategories: ["Electrician autorizat", "Schimbare tablou electric și siguranțe", "Montaj prize, întrerupătoare și corpuri de iluminat"],
  },
  {
    category: "Climatizare și Centrale Termice",
    slug: "climatizare-centrale-termice",
    label: "Climatizare & centrale termice",
    singular: "tehnician climatizare",
    subcategories: ["Montaj și service aer condiționat", "Reparații și revizii centrale termice", "Montaj calorifere și instalații de încălzire"],
  },
  {
    category: "Amenajări Interioare și Finisaje",
    slug: "amenajari-interioare",
    label: "Amenajări interioare",
    singular: "finisorist",
    subcategories: ["Zugrăveli și gletuiri", "Montaj gresie și faianță", "Montaj parchet și plinte", "Montaj rigips și tavane false"],
  },
  {
    category: "Deblocări Uși și Lăcătușerie",
    slug: "lacatuserie",
    label: "Lăcătușerie",
    singular: "lăcătuș",
    subcategories: ["Deblocare ușă locuință / auto", "Schimbare broască, yală și butuc", "Montaj uși de interior și metalice"],
  },
  {
    category: "Reparații Electrocasnice",
    slug: "reparatii-electrocasnice",
    label: "Reparații electrocasnice",
    singular: "tehnician electrocasnice",
    subcategories: ["Reparații mașini de spălat rufe și vase", "Reparații frigidere și congelatoare", "Reparații cuptoare și plite electrice"],
  },
  {
    category: "Montaj Mobilier și Handyman",
    slug: "montaj-mobilier-handyman",
    label: "Montaj mobilier & handyman",
    singular: "handyman",
    subcategories: ["Asamblare și montaj mobilă", "Prinderi și fixări (galerii, suport TV, tablouri, rafturi)", "Mici reparații generale în locuință"],
  },
  {
    category: "Mecanic auto",
    slug: "mecanici-auto",
    label: "Mecanici auto",
    singular: "mecanic auto",
    subcategories: ["Diagnoză computerizată", "Schimb ulei și filtre", "Reparații sistem frânare"],
  },
];

export function categoryBySlug(slug) {
  return CATEGORIES_SEO.find((c) => c.slug === slug) || null;
}

export function slugify(str) {
  return stripDiacritics(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Orasul e deja stocat fara diacritice in DB (ex: "Cluj-Napoca", "Bucuresti").
// Slug-ul e pur si simplu varianta lowercase; se poate reconstitui exact
// din slug fara tabel de mapare, cat timp respecta acelasi format cuvant-cuvant.
export function citySlug(cityCode) {
  return cityCode.toLowerCase();
}

export function cityFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

export function providerSlug(name, id) {
  return `${slugify(name)}-${id}`;
}

export function parseProviderId(slug) {
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}
