// Returneaza un obiect Date ale carui componente (an/luna/zi/ora) reflecta
// ora curenta din Europe/Bucharest, indiferent de fusul orar al
// serverului/browser-ului pe care ruleaza codul.
export function nowInBucharest() {
  const s = new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" });
  return new Date(s);
}

export function isoOf(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
