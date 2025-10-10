import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export const createBrazilDate = (date?: Date | string) => {
  if (!date) return dayjs().tz(BRAZIL_TIMEZONE);
  return dayjs(date).tz(BRAZIL_TIMEZONE);
};

export const formatBrazilDate = (
  date: Date | string,
  format: string = "DD/MM/YYYY"
) => {
  return createBrazilDate(date).format(format);
};

export const formatBrazilTime = (date: Date | string) => {
  const brazilDate = dayjs(date).tz(BRAZIL_TIMEZONE);
  return brazilDate.format("HH:mm");
};

export const createBrazilDateTime = (
  date: Date,
  hours: number,
  minutes: number
) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const brazilDate = dayjs()
    .tz(BRAZIL_TIMEZONE)
    .year(year)
    .month(month)
    .date(day)
    .hour(hours)
    .minute(minutes)
    .second(0)
    .millisecond(0);

  return brazilDate.toDate();
};

export const debugTimezone = (date: Date, label: string) => {
  console.log(`${label}:`, {
    original: date,
    utc: dayjs(date).utc().format("YYYY-MM-DD HH:mm:ss"),
    brazil: dayjs(date).tz(BRAZIL_TIMEZONE).format("YYYY-MM-DD HH:mm:ss"),
    local: dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
  });
};

export default dayjs;
