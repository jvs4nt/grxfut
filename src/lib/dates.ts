const SAO_PAULO = "America/Sao_Paulo";

export function todayInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SAO_PAULO }).format(
    new Date(),
  );
}

export function formatDayMonth(isoDate: string) {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function formatDayMonthYear(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function formatWeekday(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    timeZone: SAO_PAULO,
  }).format(date);
}

export function formatTime(value: string | null) {
  if (!value) {
    return null;
  }

  return value.slice(0, 5);
}

export function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Inclusive start and exclusive end (`YYYY-MM-DD`) of the current month in São Paulo. */
export function currentMonthRangeInSaoPaulo(now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: SAO_PAULO }).format(
    now,
  );
  const [yearText, monthText] = today.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const start = `${yearText}-${monthText}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endExclusive = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return { start, endExclusive };
}

export function currentMonthLabelInSaoPaulo(now = new Date()) {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: SAO_PAULO,
  }).format(now);

  return label.charAt(0).toUpperCase() + label.slice(1);
}
