import { DateTimePicker } from "@/components/ui/date-time-picker";

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  required?: boolean;
}

export default function DateTimeInput({
  value,
  onChange,
  placeholder = "DD/MM/AAAA HH:MM",
  className = "",
  style,
  required = false,
}: DateTimeInputProps) {
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const adjustedDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      onChange(adjustedDate.toISOString().slice(0, 16));
    } else {
      onChange("");
    }
  };

  const dateValue = value
    ? new Date(value + (value.includes("T") ? "" : "T00:00:00"))
    : undefined;

  return (
    <DateTimePicker
      value={dateValue}
      onChange={handleDateChange}
      placeholder={placeholder}
      className={className}
      style={style}
      required={required}
    />
  );
}
