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
