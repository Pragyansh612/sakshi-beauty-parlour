const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function parseLocalDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00`);
}

export function formatDayLabel(isoDate: string): string {
  const d = parseLocalDate(isoDate);
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
}

export function buildUpcomingDays(count: number) {
  const today = new Date();
  const days: {
    date: string;
    dow: string;
    dnum: number;
    mon: string;
    full: string;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: iso,
      dow: DOW[d.getDay()],
      dnum: d.getDate(),
      mon: MON[d.getMonth()],
      full: formatDayLabel(iso),
    });
  }

  return days;
}
