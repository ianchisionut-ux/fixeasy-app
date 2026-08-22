// Elimina diacriticele romanesti, pentru a compara/potrivi cu valorile
// stocate in baza de date (care nu contin diacritice: "Bucuresti", "Iasi" etc).
export function stripDiacritics(s) {
  if (!s) return s;
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ș/gi, "s")
    .replace(/ş/gi, "s")
    .replace(/ț/gi, "t")
    .replace(/ţ/gi, "t")
    .replace(/ă/gi, "a")
    .replace(/â/gi, "a")
    .replace(/î/gi, "i");
}

// Incearca sa afle orasul utilizatorului din geolocatia browserului,
// via reverse-geocoding gratuit (fara cheie API).
export function detectCity() {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ro`
          );
          const data = await res.json();
          const name = data.city || data.locality || data.principalSubdivision || null;
          resolve(name);
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

export const COMMON_CITIES = [
  "București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța",
  "Brașov", "Craiova", "Galați", "Ploiești", "Oradea",
];

// Bazele de date stocheaza orasele fara diacritice; aici le afisam frumos.
const CITY_DISPLAY_MAP = {
  Bucuresti: "București",
  Timisoara: "Timișoara",
  Iasi: "Iași",
  Constanta: "Constanța",
  Brasov: "Brașov",
  Galati: "Galați",
  Ploiesti: "Ploiești",
};

export function displayCity(code) {
  if (!code) return code;
  return CITY_DISPLAY_MAP[code] || code;
}
