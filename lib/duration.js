export function formatDuration(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} ${h === 1 ? "oră" : "ore"}`;
  return `${h} ${h === 1 ? "oră" : "ore"} ${m} min`;
}

export function toMinutes(hours, minutes) {
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

export function splitMinutes(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}
