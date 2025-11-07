import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { isValidHex, normalizeHex, sanitizeHex } from "../utils/colorValidation";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  predefinedColors?: readonly string[];
  label?: string;
  id?: string;
}

export default function ColorPicker({
  value,
  onChange,
  predefinedColors = [],
  label = "Cor",
  id,
}: ColorPickerProps) {
  const { state } = useApp();
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [hasBlurred, setHasBlurred] = useState(false);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
    setIsValid(true);
    setHasBlurred(false);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    if (rawValue === "") {
      setIsValid(true);
      return;
    }

    const sanitized = sanitizeHex(rawValue);
    const valid = isValidHex(sanitized);

    setIsValid(valid);

    if (valid) {
      const normalized = normalizeHex(sanitized);
      if (normalized) {
        onChange(normalized);
      }
    }
  };

  const handleInputBlur = () => {
    setHasBlurred(true);

    if (inputValue === "") {
      const defaultColor = predefinedColors[0] || "#ec4899";
      setInputValue(defaultColor);
      onChange(defaultColor);
      setIsValid(true);
      return;
    }

    const sanitized = sanitizeHex(inputValue);
    const normalized = normalizeHex(sanitized);

    if (normalized && isValidHex(normalized)) {
      setInputValue(normalized);
      onChange(normalized);
      setIsValid(true);
    } else {
      setInputValue(value);
      setIsValid(true);
    }
  };

  const handlePredefinedColorClick = (color: string) => {
    setInputValue(color);
    onChange(color);
    setIsValid(true);
    setHasBlurred(false);
  };

  const handlePreviewClick = () => {
    colorPickerRef.current?.click();
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedColor = e.target.value.toUpperCase();
    setInputValue(selectedColor);
    onChange(selectedColor);
    setIsValid(true);
    setHasBlurred(false);
  };

  const displayColor = isValidHex(inputValue) ? normalizeHex(inputValue) || value : value;
  const showError = hasBlurred && !isValid && inputValue !== "";
  
  const colorPickerValue = isValidHex(displayColor) ? displayColor : (predefinedColors[0] || "#EC4899");

  const inputId = id || `color-picker-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-3">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium"
          style={{ color: state.currentTheme.colors.text }}
        >
          {label}
        </label>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <input
              ref={colorPickerRef}
              type="color"
              value={colorPickerValue}
              onChange={handleColorPickerChange}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              aria-label="Seletor de cor nativo"
            />
            <button
              type="button"
              onClick={handlePreviewClick}
              className="w-12 h-12 rounded-lg border-2 shadow-sm transition-all cursor-pointer hover:scale-105 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: displayColor,
                borderColor: showError
                  ? state.currentTheme.colors.error
                  : state.currentTheme.colors.border,
                "--tw-ring-color": state.currentTheme.colors.primary,
              } as React.CSSProperties}
              aria-label={`Abrir seletor de cor. Cor atual: ${displayColor}`}
            />
            {showError && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center pointer-events-none"
                style={{
                  backgroundColor: state.currentTheme.colors.error,
                  borderColor: state.currentTheme.colors.surface,
                }}
                aria-label="Cor inválida"
              >
                <span className="text-white text-xs font-bold">!</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              id={inputId}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              placeholder="#RRGGBB ou #RGB"
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: showError
                    ? state.currentTheme.colors.error
                    : state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": showError
                    ? state.currentTheme.colors.error
                    : state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
              aria-label="Código HEX da cor"
              aria-invalid={showError}
              aria-describedby={showError ? `${inputId}-error` : undefined}
              maxLength={7}
            />
            {showError && (
              <p
                id={`${inputId}-error`}
                className="text-xs mt-1"
                style={{ color: state.currentTheme.colors.error }}
                role="alert"
              >
                Código HEX inválido. Use o formato #RRGGBB ou #RGB
              </p>
            )}
          </div>
        </div>

        {predefinedColors.length > 0 && (
          <div>
            <p
              className="text-xs mb-2"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Cores pré-definidas
            </p>
            <div
              className="grid grid-cols-6 sm:grid-cols-10 gap-2"
              role="group"
              aria-label="Cores pré-definidas"
            >
              {predefinedColors.map((color) => {
                const isSelected = normalizeHex(value) === normalizeHex(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handlePredefinedColorClick(color)}
                    className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 ${
                      isSelected ? "scale-110 ring-2" : ""
                    }`}
                    style={{
                      backgroundColor: color,
                      borderColor: isSelected
                        ? state.currentTheme.colors.text
                        : state.currentTheme.colors.border,
                      "--tw-ring-color": state.currentTheme.colors.primary,
                    } as React.CSSProperties}
                    aria-label={`Selecionar cor ${color}`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check
                          className="w-4 h-4 text-white drop-shadow-md"
                          style={{
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                          }}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

