// Magazin de date în memorie — pentru producție, se înlocuiește cu
// Prisma + PostgreSQL (vezi FixEasy-Specificatii.md, secțiunea 7-8).
// Structura API-ului rămâne identică, doar sursa de date se schimbă.

export const providers = [
  { id: "p1", name: "Ionescu Instalații", cat: "Instalator", city: "București", rating: 4.9, reviews: 214, priceFrom: 120, tags: ["Urgențe 24/7", "Sector 1-3"], init: "II",
    services: [
      { id: "s1", name: "Înlocuire baterie sanitară", price: 120, duration: 45 },
      { id: "s2", name: "Reparație scurgere calorifer", price: 150, duration: 60 },
      { id: "s3", name: "Montaj centrală termică", price: 450, duration: 180 },
    ] },
  { id: "p2", name: "ElectroPro Radu", cat: "Electrician", city: "București", rating: 4.8, reviews: 167, priceFrom: 100, tags: ["Tablou electric", "Autorizat ANRE"], init: "ER",
    services: [
      { id: "s4", name: "Verificare tablou electric", price: 100, duration: 45 },
      { id: "s5", name: "Montaj corp de iluminat", price: 90, duration: 30 },
      { id: "s6", name: "Înlocuire priză/întrerupător", price: 60, duration: 20 },
    ] },
  { id: "p3", name: "AutoFix Mihai", cat: "Mecanic auto", city: "București", rating: 4.7, reviews: 98, priceFrom: 150, tags: ["Diagnoză gratuită", "La domiciliu"], init: "AM",
    services: [
      { id: "s7", name: "Diagnoză computerizată", price: 0, duration: 30 },
      { id: "s8", name: "Schimb ulei + filtre", price: 220, duration: 45 },
      { id: "s9", name: "Reparație sistem frânare", price: 380, duration: 120 },
    ] },
  { id: "p4", name: "Instal Serv Dan", cat: "Instalator", city: "București", rating: 4.9, reviews: 301, priceFrom: 110, tags: ["Centrale termice"], init: "ID",
    services: [
      { id: "s10", name: "Desfundare canalizare", price: 130, duration: 60 },
      { id: "s11", name: "Montaj obiecte sanitare", price: 200, duration: 90 },
    ] },
  { id: "p5", name: "VoltMaster Cristi", cat: "Electrician", city: "București", rating: 4.6, reviews: 89, priceFrom: 90, tags: ["Iluminat smart"], init: "VC",
    services: [
      { id: "s12", name: "Configurare iluminat smart", price: 180, duration: 60 },
      { id: "s13", name: "Instalație electrică nouă (cameră)", price: 350, duration: 240 },
    ] },
  { id: "p6", name: "MecanicPlus Andrei", cat: "Mecanic auto", city: "București", rating: 4.9, reviews: 176, priceFrom: 140, tags: ["Piese originale"], init: "MA",
    services: [
      { id: "s14", name: "Revizie completă", price: 350, duration: 90 },
      { id: "s15", name: "Schimb plăcuțe frână", price: 280, duration: 60 },
    ] },
];

// Câteva programări demo, ca dashboard-ul să nu pornească gol.
export const bookings = [
  { id: "b1001", providerId: "p1", providerName: "Ionescu Instalații", serviceName: "Reparație scurgere calorifer",
    clientName: "Maria I.", phone: "0722***456", date: "azi", time: "16:30", status: "confirmed", createdAt: Date.now() - 1000 * 60 * 60 * 5 },
  { id: "b1002", providerId: "p1", providerName: "Ionescu Instalații", serviceName: "Înlocuire baterie sanitară",
    clientName: "Andrei M.", phone: "0733***112", date: "azi", time: "14:00", status: "pending", createdAt: Date.now() - 1000 * 60 * 30 },
  { id: "b1003", providerId: "p2", providerName: "ElectroPro Radu", serviceName: "Montaj corp de iluminat",
    clientName: "Costin V.", phone: "0744***890", date: "mâine", time: "09:00", status: "confirmed", createdAt: Date.now() - 1000 * 60 * 60 * 2 },
];

let bookingSeq = 1004;

export function listProviders(category) {
  if (!category || category === "Toți") return providers;
  return providers.filter((p) => p.cat === category);
}

export function getProvider(id) {
  return providers.find((p) => p.id === id) || null;
}

export function listBookings(providerId) {
  const sorted = [...bookings].sort((a, b) => b.createdAt - a.createdAt);
  if (!providerId) return sorted;
  return sorted.filter((b) => b.providerId === providerId);
}

export function createBooking({ providerId, serviceId, clientName, phone, date, time }) {
  const provider = getProvider(providerId);
  if (!provider) throw new Error("Prestator inexistent");
  const service = provider.services.find((s) => s.id === serviceId);
  if (!service) throw new Error("Serviciu inexistent");
  if (!clientName || !phone || !date || !time) throw new Error("Date incomplete pentru programare");

  const booking = {
    id: "b" + bookingSeq++,
    providerId,
    providerName: provider.name,
    serviceName: service.name,
    clientName,
    phone,
    date,
    time,
    status: "pending",
    createdAt: Date.now(),
  };
  bookings.push(booking);
  return booking;
}
