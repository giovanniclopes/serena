import { Eraser, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";

interface DrawingCanvasProps {
  onSave: (imageData: string) => void;
  onCancel: () => void;
  initialColor?: string;
  initialBrushSize?: number;
}

export default function DrawingCanvas({
  onSave,
  onCancel,
  initialColor = "#000000",
  initialBrushSize = 5,
}: DrawingCanvasProps) {
  const { state } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(initialColor);
  const [brushSize, setBrushSize] = useState(initialBrushSize);
  const [isEraser, setIsEraser] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#A52A2A",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    contextRef.current = context;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !contextRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    contextRef.current.lineWidth = brushSize;
    contextRef.current.lineCap = "round";
    contextRef.current.lineJoin = "round";

    if (isEraser) {
      contextRef.current.globalCompositeOperation = "destination-out";
    } else {
      contextRef.current.globalCompositeOperation = "source-over";
      contextRef.current.strokeStyle = color;
    }

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.beginPath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    contextRef.current.fillStyle = "#FFFFFF";
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");
    onSave(imageData);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 border rounded-lg overflow-hidden"
        style={{ borderColor: state.currentTheme.colors.border }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
          style={{
            backgroundColor: "#FFFFFF",
            display: "block",
          }}
        />
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              className="text-sm"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Cor:
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    setIsEraser(false);
                  }}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor:
                      color === c
                        ? state.currentTheme.colors.primary
                        : "transparent",
                  }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`p-2 rounded transition-colors ${
              isEraser ? "bg-primary/20" : "hover:bg-black/5"
            }`}
            style={{
              color: isEraser
                ? state.currentTheme.colors.primary
                : state.currentTheme.colors.textSecondary,
            }}
            aria-label="Borracha"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              className="text-sm"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Espessura:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBrushSize(Math.max(1, brushSize - 2))}
                className="p-1 rounded hover:bg-black/5"
                style={{ color: state.currentTheme.colors.textSecondary }}
                aria-label="Diminuir espessura"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                className="text-sm w-8 text-center"
                style={{ color: state.currentTheme.colors.text }}
              >
                {brushSize}
              </span>
              <button
                type="button"
                onClick={() => setBrushSize(Math.min(50, brushSize + 2))}
                className="p-1 rounded hover:bg-black/5"
                style={{ color: state.currentTheme.colors.textSecondary }}
                aria-label="Aumentar espessura"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={clearCanvas}
            className="p-2 rounded hover:bg-black/5 transition-colors"
            style={{ color: state.currentTheme.colors.textSecondary }}
            aria-label="Limpar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div
          className="flex justify-end gap-2 pt-2 border-t"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
