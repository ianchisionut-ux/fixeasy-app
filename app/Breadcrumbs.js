const SITE_URL = "https://fixeasy-app-pmcustoms.vercel.app";

export default function Breadcrumbs({ items }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb" className="breadcrumbs">
        {items.map((item, i) => (
          <span key={item.href}>
            {i > 0 && <span className="sep">/</span>}
            {i === items.length - 1 ? (
              <span className="current">{item.label}</span>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
