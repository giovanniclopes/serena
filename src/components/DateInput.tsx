import { DatePicker } from "@/components/ui/date-picker";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  required?: boolean;
}

export default function DateInput({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  className = "",
  style,
  required = false,
}: DateInputProps) {
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onChange(date.toISOString().split("T")[0]);
    } else {
      onChange("");
    }
  };

  const dateValue = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <DatePicker
      value={dateValue}
      onChange={handleDateChange}
      placeholder={placeholder}
      className={className}
      style={style}
      required={required}
    />
  );
}
