import { stripDiacritics } from "./geo";

// Meseriile suportate, cu slug-ul lor pentru URL si etichete afisate.
export const CATEGORIES_SEO = [
  { category: "Instalator", slug: "instalatori", label: "Instalatori", singular: "instalator" },
  { category: "Electrician", slug: "electricieni", label: "Electricieni", singular: "electrician" },
  { category: "Mecanic auto", slug: "mecanici-auto", label: "Mecanici auto", singular: "mecanic auto" },
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
