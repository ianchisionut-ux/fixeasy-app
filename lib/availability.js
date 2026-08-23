import { query } from "./db";

export const FIXED_SLOTS = ["09:00", "10:30", "11:00", "13:00", "14:30", "16:00"];
export const WEEKDAY_LABELS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

// Convertim JS getDay() (0=Duminica..6=Sambata) in convenția noastră (0=Luni..6=Duminica).
export function toOurWeekday(jsDay) {
  return (jsDay + 6) % 7;
}

// Calculeaza sloturile disponibile pentru un prestator, pentru urmatoarele `days` zile,
// combinand programul saptamanal, blocarile punctuale si programarile deja existente.
export async function getAvailability(providerId, days = 7) {
  const [scheduleResult, timeOffResult, bookingsResult] = await Promise.all([
    query("SELECT weekday, is_working, start_time, end_time FROM provider_availability WHERE provider_id = $1", [providerId]),
    query(
      `SELECT off_date, start_time, end_time FROM provider_time_off
       WHERE provider_id = $1 AND off_date >= CURRENT_DATE AND off_date <= CURRENT_DATE + $2::int`,
      [providerId, days + 1]
    ),
    query(
      `SELECT scheduled_date, scheduled_time FROM bookings
       WHERE provider_id = $1 AND status IN ('pending','confirmed')
       AND scheduled_date >= CURRENT_DATE AND scheduled_date <= CURRENT_DATE + $2::int`,
      [providerId, days + 1]
    ),
  ]);

  const scheduleByWeekday = {};
  for (const row of scheduleResult.rows) scheduleByWeekday[row.weekday] = row;

  const timeOffByDate = {};
  for (const row of timeOffResult.rows) {
    const key = isoOfDbDate(row.off_date);
    (timeOffByDate[key] ||= []).push(row);
  }

  const bookedByDate = {};
  for (const row of bookingsResult.rows) {
    const key = isoOfDbDate(row.scheduled_date);
    (bookedByDate[key] ||= new Set()).add(row.scheduled_time);
  }

  const result = [];
  const now = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const weekday = toOurWeekday(d.getDay());
    const schedule = scheduleByWeekday[weekday];

    let slots = [];
    if (schedule && schedule.is_working) {
      slots = FIXED_SLOTS.filter((t) => t >= schedule.start_time && t < schedule.end_time);
    }

    const blocks = timeOffByDate[iso] || [];
    for (const b of blocks) {
      if (!b.start_time && !b.end_time) {
        slots = []; // toata ziua blocata
      } else {
        slots = slots.filter((t) => t < b.start_time || t >= b.end_time);
      }
    }

    const booked = bookedByDate[iso];
    if (booked) slots = slots.filter((t) => !booked.has(t));

    result.push({ date: iso, weekday, slots });
  }
  return result;
}

function isoOfDbDate(d) {
  // node-postgres poate returna DATE ca obiect Date sau ca string, in functie de driver/config.
  if (typeof d === "string") return d.split("T")[0];
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
