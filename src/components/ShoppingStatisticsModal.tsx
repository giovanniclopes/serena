import {
  BarChart3,
  DollarSign,
  MapPin,
  ShoppingCart,
  TrendingUp,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import type { ShoppingStatistics } from "../types";

interface ShoppingStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: ShoppingStatistics;
}

export default function ShoppingStatisticsModal({
  isOpen,
  onClose,
  statistics,
}: ShoppingStatisticsModalProps) {
  const { state } = useApp();

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            <BarChart3 className="w-5 h-5" />
            Estatísticas de Compras
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-opacity-10"
            style={{
              color: state.currentTheme.colors.textSecondary,
              backgroundColor: state.currentTheme.colors.textSecondary + "10",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign
                  className="w-5 h-5"
                  style={{ color: state.currentTheme.colors.primary }}
                />
                <h3
                  className="text-sm font-medium"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Total Gasto
                </h3>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {formatCurrency(statistics.totalSpent)}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart
                  className="w-5 h-5"
                  style={{ color: state.currentTheme.colors.primary }}
                />
                <h3
                  className="text-sm font-medium"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Listas Criadas
                </h3>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {statistics.totalLists}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: state.currentTheme.colors.success }}
                />
                <h3
                  className="text-sm font-medium"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Taxa de Conclusão
                </h3>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {formatPercentage(
                  statistics.completedLists,
                  statistics.totalLists
                )}
                %
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3
                  className="w-5 h-5"
                  style={{ color: state.currentTheme.colors.primary }}
                />
                <h3
                  className="text-sm font-medium"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Valor Médio
                </h3>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {formatCurrency(statistics.averageListValue)}
              </p>
            </div>
          </div>

          {statistics.spendingByCategory.length > 0 && (
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: state.currentTheme.colors.text }}
              >
                Gastos por Categoria
              </h3>
              <div className="space-y-3">
                {statistics.spendingByCategory.map(
                  (
                    category: {
                      category: string;
                      amount: number;
                      count: number;
                    },
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{
                        backgroundColor: state.currentTheme.colors.background,
                        borderColor: state.currentTheme.colors.border,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(${
                              (index * 137.5) % 360
                            }, 70%, 50%)`,
                          }}
                        />
                        <span
                          className="font-medium"
                          style={{ color: state.currentTheme.colors.text }}
                        >
                          {category.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-semibold"
                          style={{ color: state.currentTheme.colors.text }}
                        >
                          {formatCurrency(category.amount)}
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {category.count} lista
                          {category.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {statistics.mostPurchasedItems.length > 0 && (
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: state.currentTheme.colors.text }}
              >
                Itens Mais Comprados
              </h3>
              <div className="space-y-3">
                {statistics.mostPurchasedItems
                  .slice(0, 5)
                  .map(
                    (
                      item: { name: string; count: number; totalSpent: number },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{
                          backgroundColor: state.currentTheme.colors.background,
                          borderColor: state.currentTheme.colors.border,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{
                              backgroundColor:
                                state.currentTheme.colors.primary,
                            }}
                          >
                            {index + 1}
                          </div>
                          <span
                            className="font-medium"
                            style={{ color: state.currentTheme.colors.text }}
                          >
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-semibold"
                            style={{ color: state.currentTheme.colors.text }}
                          >
                            {item.count}x
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {formatCurrency(item.totalSpent)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}

          {statistics.topLocations.length > 0 && (
            <div>
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                <MapPin className="w-5 h-5" />
                Lojas Mais Frequentes
              </h3>
              <div className="space-y-3">
                {statistics.topLocations
                  .slice(0, 5)
                  .map(
                    (
                      location: {
                        location: string;
                        amount: number;
                        count: number;
                      },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{
                          backgroundColor: state.currentTheme.colors.background,
                          borderColor: state.currentTheme.colors.border,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{
                              backgroundColor:
                                state.currentTheme.colors.primary,
                            }}
                          >
                            {index + 1}
                          </div>
                          <span
                            className="font-medium"
                            style={{ color: state.currentTheme.colors.text }}
                          >
                            {location.location}
                          </span>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-semibold"
                            style={{ color: state.currentTheme.colors.text }}
                          >
                            {formatCurrency(location.amount)}
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {location.count} visita
                            {location.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}

          {statistics.spendingByMonth.length > 0 && (
            <div>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: state.currentTheme.colors.text }}
              >
                Gastos por Mês
              </h3>
              <div className="space-y-3">
                {statistics.spendingByMonth
                  .slice(0, 6)
                  .map(
                    (
                      month: { month: string; amount: number; count: number },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{
                          backgroundColor: state.currentTheme.colors.background,
                          borderColor: state.currentTheme.colors.border,
                        }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: state.currentTheme.colors.text }}
                        >
                          {month.month}
                        </span>
                        <div className="text-right">
                          <p
                            className="font-semibold"
                            style={{ color: state.currentTheme.colors.text }}
                          >
                            {formatCurrency(month.amount)}
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {month.count} lista{month.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex justify-end p-4 border-t"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
