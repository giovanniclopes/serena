import { ExternalLink, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { ShoppingListItem } from "../types";

interface ShoppingListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    quantity?: string;
    notes?: string;
    price?: number;
    links?: string[];
  }) => void;
  listId: string;
  item?: ShoppingListItem;
}

export default function ShoppingListItemModal({
  isOpen,
  onClose,
  onSave,
  item,
}: ShoppingListItemModalProps) {
  const { state } = useApp();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity || "");
      setNotes(item.notes || "");
      setLinks(item.links || []);
      if (item.price) {
        setPrice(item.price.toString());
        const formatted = item.price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        setPriceDisplay(formatted);
      } else {
        setPrice("");
        setPriceDisplay("");
      }
    } else {
      setName("");
      setQuantity("");
      setNotes("");
      setPrice("");
      setPriceDisplay("");
      setLinks([]);
    }
    setNewLink("");
  }, [item, isOpen]);

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      setPriceDisplay("");
      setPrice("");
      return;
    }

    const cents = parseInt(numericValue);
    const reais = cents / 100;

    const formatted = reais.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setPriceDisplay(formatted);
    setPrice(reais.toString());
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    const url = newLink.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setLinks([...links, `https://${url}`]);
    } else {
      setLinks([...links, url]);
    }
    setNewLink("");
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const priceValue = price.trim() ? parseFloat(price.trim()) : undefined;

    onSave({
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      notes: notes.trim() || undefined,
      price: priceValue,
      links: links.length > 0 ? links : undefined,
    });

    if (!item) {
      setName("");
      setQuantity("");
      setNotes("");
      setPrice("");
      setPriceDisplay("");
      setLinks([]);
    }
  };

  const handleClose = () => {
    onClose();
    if (!item) {
      setName("");
      setQuantity("");
      setNotes("");
      setPrice("");
      setPriceDisplay("");
      setLinks([]);
    }
    setNewLink("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg w-full max-w-md"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: state.currentTheme.colors.text }}
          >
            {item ? "Editar Item" : "Novo Item"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg transition-colors hover:bg-opacity-10"
            style={{
              color: state.currentTheme.colors.textSecondary,
              backgroundColor: state.currentTheme.colors.textSecondary + "10",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Nome do Item *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Shampoo, Leite, Pão..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Quantidade
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 2 unidades, 1kg, 500ml..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Preço
            </label>
            <input
              type="text"
              value={priceDisplay}
              onInput={(e) => handlePriceChange(e.currentTarget.value)}
              placeholder="Ex: R$ 15,50"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Links
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                  placeholder="https://exemplo.com"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={
                    {
                      backgroundColor: state.currentTheme.colors.background,
                      borderColor: state.currentTheme.colors.border,
                      color: state.currentTheme.colors.text,
                      "--tw-ring-color": state.currentTheme.colors.primary,
                    } as React.CSSProperties
                  }
                />
                <button
                  onClick={handleAddLink}
                  disabled={!newLink.trim()}
                  className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: state.currentTheme.colors.primary,
                    color: "white",
                  }}
                  aria-label="Adicionar link"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {links.length > 0 && (
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg border"
                      style={{
                        backgroundColor: state.currentTheme.colors.background,
                        borderColor: state.currentTheme.colors.border,
                      }}
                    >
                      <ExternalLink
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: state.currentTheme.colors.primary }}
                      />
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm truncate hover:underline"
                        style={{ color: state.currentTheme.colors.primary }}
                      >
                        {link}
                      </a>
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="p-1 rounded transition-colors hover:bg-opacity-10"
                        style={{
                          color: state.currentTheme.colors.error,
                          backgroundColor: state.currentTheme.colors.error + "10",
                        }}
                        aria-label="Remover link"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
              
        <div
          className="flex space-x-3 p-4 border-t"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              color: state.currentTheme.colors.textSecondary,
              border: `1px solid ${state.currentTheme.colors.border}`,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            <Plus className="w-4 h-4" />
            <span>{item ? "Salvar" : "Adicionar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
