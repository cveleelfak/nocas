export interface NightOption {
  label: string;
  date: string;
}

const DAY_NAMES = ['Ned', 'Pon', 'Uto', 'Sre', 'Cet', 'Pet', 'Sub'];
const NIGHT_ENDS_AT_HOUR = 6;

export function upcomingNights(count = 5): NightOption[] {
  const tonight = new Date();
  if (tonight.getHours() < NIGHT_ENDS_AT_HOUR) {
    tonight.setDate(tonight.getDate() - 1);
  }
  return Array.from({ length: count }, (_, offset) => {
    const day = new Date(tonight);
    day.setDate(tonight.getDate() + offset);
    return { label: nightLabel(day, offset), date: toIsoDate(day) };
  });
}

function nightLabel(day: Date, offset: number): string {
  if (offset === 0) {
    return 'Veceras';
  }
  if (offset === 1) {
    return 'Sutra';
  }
  return `${DAY_NAMES[day.getDay()]} ${day.getDate()}.${day.getMonth() + 1}.`;
}

function toIsoDate(day: Date): string {
  const month = String(day.getMonth() + 1).padStart(2, '0');
  const date = String(day.getDate()).padStart(2, '0');
  return `${day.getFullYear()}-${month}-${date}`;
}