"use client";

import { useState, useEffect, useCallback } from "react";
import { stripDiacritics, detectCity, COMMON_CITIES, displayCity } from "../lib/geo";
import { CATEGORIES_SEO, citySlug, providerSlug } from "../lib/seo";
import BookingModal from "./BookingModal";

const CATEGORIES = ["Toți", "Instalator", "Electrician", "Mecanic auto"];

export default function HomeClient({ initialProviders, isLoggedIn, userRole }) {
  const [category, setCategory] = useState("Toți");
  const [cityFilter, setCityFilter] = useState(null); // valoare fara diacritice, trimisa la API
  const [cityDisplay, setCityDisplay] = useState(null); // eticheta frumoasa, aratata userului
  const [cityStatus, setCityStatus] = useState("idle"); // idle | detecting | done
  const [providers, setProviders] = useState(initialProviders);
  const [loading, setLoading] = useState(false);
  const [bookingFor, setBookingFor] = useState(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [knownCities, setKnownCities] = useState([]);

  // La incarcare: preferinta salvata, altfel incearca geolocatia automat.
  useEffect(() => {
    const savedFilter = localStorage.getItem("fixeasy_city_filter");
    const savedDisplay = localStorage.getItem("fixeasy_city_display");
    if (savedFilter) {
      setCityFilter(savedFilter);
      setCityDisplay(savedDisplay || savedFilter);
      setCityStatus("done");
      return;
    }
    setCityStatus("detecting");
    detectCity().then((name) => {
      if (name) {
        const filterVal = stripDiacritics(name);
        setCityFilter(filterVal);
        setCityDisplay(name);
        localStorage.setItem("fixeasy_city_filter", filterVal);
        localStorage.setItem("fixeasy_city_display", name);
      }
      setCityStatus("done");
    });

    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => setKnownCities(d.cities || []))
      .catch(() => {});
  }, []);

  // Reincarca prestatorii de fiecare data cand se schimba categoria sau orasul.
  useEffect(() => {
    if (cityStatus !== "done") return;
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "Toți") params.set("category", category);
    if (cityFilter) params.set("city", cityFilter);
    fetch(`/api/providers?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setProviders(d.providers))
      .finally(() => setLoading(false));
  }, [category, cityFilter, cityStatus]);

  const applyCity = useCallback((filterVal, displayVal) => {
    if (filterVal === null) {
      setCityFilter(null);
      setCityDisplay(null);
      localStorage.removeItem("fixeasy_city_filter");
      localStorage.removeItem("fixeasy_city_display");
    } else {
      setCityFilter(filterVal);
      setCityDisplay(displayVal);
      localStorage.setItem("fixeasy_city_filter", filterVal);
      localStorage.setItem("fixeasy_city_display", displayVal);
    }
    setShowCityModal(false);
  }, []);

  async function useMyLocation() {
    setCityStatus("detecting");
    const name = await detectCity();
    if (name) {
      applyCity(stripDiacritics(name), name);
    }
    setCityStatus("done");
  }

  const cityLabel =
    cityStatus === "detecting" ? "Se detectează orașul…" : cityDisplay || "Toate orașele";

  return (
    <>
      <div className="hero">
        <span className="eyebrow">
          ● {providers.length} profesioniști verificați {cityDisplay ? `în ${cityDisplay}` : "activi azi"}
        </span>
        <h1>Găsești profesionistul potrivit.<br />Programezi în 60 de secunde.</h1>
        <p>Instalatori, electricieni și mecanici auto verificați, aproape de tine — programarea se salvează live, cu status urmărit în dashboard.</p>

        <div className="hero-search">
          <button className="city-btn" onClick={() => setShowCityModal(true)} disabled={cityStatus === "detecting"}>
            📍 {cityLabel} <span style={{ opacity: 0.6 }}>▾</span>
          </button>
          <a href="#marketplace" className="btn btn-orange btn-lg">Caută profesioniști</a>
        </div>

        {!isLoggedIn && (
          <a href="/inregistrare" className="hero-provider-link">Ești profesionist? Găsește clienți noi în zona ta →</a>
        )}

        <div className="hero-stats">
          <div><span className="stat-num">1.840+</span><span className="stat-label">Programări/lună</span></div>
          <div><span className="stat-num">412</span><span className="stat-label">Prestatori verificați</span></div>
          <div><span className="stat-num">&lt;15 min</span><span className="stat-label">Timp confirmare</span></div>
        </div>
      </div>

      <section id="marketplace">
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Prestatori</span>
          <h2>Alege și programează</h2>
          <p>Fiecare programare e salvată real prin API — vezi rezultatul în dashboard.</p>
        </div>

        <div className="cat-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={"cat-btn" + (category === cat ? " active" : "")}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="results-toolbar">
          <span>{cityDisplay ? `Arată prestatori din ${cityDisplay}` : "Arată prestatori din toate orașele"}</span>
          <button onClick={() => setShowCityModal(true)}>Schimbă orașul</button>
        </div>

        {providers.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="big">🔍</div>
            <p>Niciun prestator încă {cityDisplay ? `în ${cityDisplay}` : ""} pentru această categorie.</p>
            {cityDisplay && (
              <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={() => applyCity(null, null)}>
                Vezi din toate orașele
              </button>
            )}
          </div>
        ) : (
          <div className="prov-grid" style={{ opacity: loading ? 0.5 : 1 }}>
            {providers.map((p) => {
              const catSeo = CATEGORIES_SEO.find((c) => c.category === p.cat);
              const href = catSeo ? `/${catSeo.slug}/${citySlug(p.city)}/${providerSlug(p.name, p.id)}` : null;
              return (
              <div className="prov-card" key={p.id}>
                <div className="prov-top">
                  <div className="prov-head">
                    <div className="avatar">{p.init}</div>
                    <div>
                      <div className="prov-name">
                        {href ? <a href={href} style={{ color: "inherit" }}>{p.name}</a> : p.name} {p.tags?.length > 0 && <span className="badge-verified">VERIFICAT</span>}
                      </div>
                      <div className="prov-meta">{p.cat} · 📍 {displayCity(p.city)}</div>
                    </div>
                  </div>
                  <div className="prov-rating">
                    ★ {p.rating} <span style={{ color: "var(--slate)", fontWeight: 400 }}>({p.reviews} recenzii)</span>
                  </div>
                  <div className="prov-tags">
                    {p.tags.map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="prov-bottom">
                  <div className="prov-price">de la <b>{p.priceFrom} lei</b></div>
                  <button className="btn btn-orange" onClick={() => setBookingFor(p)}>Programează</button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {showCityModal && (
        <CityModal
          knownCities={knownCities}
          currentFilter={cityFilter}
          onUseLocation={useMyLocation}
          onSelect={applyCity}
          onClose={() => setShowCityModal(false)}
        />
      )}

      {bookingFor && (
        <BookingModal
          provider={bookingFor}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          onClose={() => setBookingFor(null)}
        />
      )}
    </>
  );
}

function CityModal({ knownCities, currentFilter, onUseLocation, onSelect, onClose }) {
  const [detecting, setDetecting] = useState(false);
  const knownNames = new Set(knownCities.map((c) => stripDiacritics(c.city)));
  const extraCities = COMMON_CITIES.filter((c) => !knownNames.has(stripDiacritics(c)));

  async function handleUseLocation() {
    setDetecting(true);
    await onUseLocation();
    setDetecting(false);
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>Alege orașul</h3>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <button className="geo-btn" onClick={handleUseLocation} disabled={detecting}>
            📍 {detecting ? "Se detectează…" : "Folosește locația mea"}
          </button>

          <div className="city-list">
            <div className={"city-option" + (!currentFilter ? " active" : "")} onClick={() => onSelect(null, null)}>
              <span>Toate orașele</span>
            </div>
            {knownCities.map((c) => (
              <div
                key={c.city}
                className={"city-option" + (currentFilter === c.city ? " active" : "")}
                onClick={() => onSelect(c.city, displayCity(c.city))}
              >
                <span>{displayCity(c.city)}</span>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>{c.count} prestatori</span>
              </div>
            ))}
            {extraCities.map((c) => (
              <div
                key={c}
                className={"city-option" + (currentFilter === stripDiacritics(c) ? " active" : "")}
                onClick={() => onSelect(stripDiacritics(c), c)}
              >
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
