import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Configurar plugins do dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para São Paulo/Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

// Função helper para criar datas no timezone do Brasil
export const createBrazilDate = (date?: Date | string) => {
  if (!date) return dayjs().tz(BRAZIL_TIMEZONE);
  return dayjs(date).tz(BRAZIL_TIMEZONE);
};

// Função helper para formatar datas no timezone do Brasil
export const formatBrazilDate = (
  date: Date | string,
  format: string = "DD/MM/YYYY"
) => {
  return createBrazilDate(date).format(format);
};

// Função helper para formatar horário no timezone do Brasil
export const formatBrazilTime = (date: Date | string) => {
  // Se a data está em UTC, converter para timezone do Brasil
  const brazilDate = dayjs(date).tz(BRAZIL_TIMEZONE);
  return brazilDate.format("HH:mm");
};

// Função helper para criar data com horário específico no timezone do Brasil
export const createBrazilDateTime = (
  date: Date,
  hours: number,
  minutes: number
) => {
  // Criar data diretamente em UTC com o horário desejado
  // Isso evita problemas de conversão de timezone
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Criar data UTC diretamente
  const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));

  return utcDate;
};

// Função de debug para verificar timezone
export const debugTimezone = (date: Date, label: string) => {
  console.log(`${label}:`, {
    original: date,
    utc: dayjs(date).utc().format("YYYY-MM-DD HH:mm:ss"),
    brazil: dayjs(date).tz(BRAZIL_TIMEZONE).format("YYYY-MM-DD HH:mm:ss"),
    local: dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
  });
};

export default dayjs;
