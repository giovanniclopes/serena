import { useMemo } from "react";
import type { ShoppingList, ShoppingStatistics } from "../types";

export function useShoppingStatistics(
  shoppingLists: ShoppingList[]
): ShoppingStatistics {
  return useMemo(() => {
    const completedLists = shoppingLists.filter((list) => list.isCompleted);

    const totalSpent = shoppingLists.reduce((total, list) => {
      return (
        total +
        list.items.reduce((listTotal, item) => {
          return (
            listTotal +
            (item.isPurchased && item.actualPrice ? item.actualPrice : 0)
          );
        }, 0)
      );
    }, 0);

    const averageListValue =
      completedLists.length > 0 ? totalSpent / completedLists.length : 0;

    const spendingByCategory = shoppingLists.reduce((acc, list) => {
      const listSpent = list.items.reduce((total, item) => {
        return (
          total + (item.isPurchased && item.actualPrice ? item.actualPrice : 0)
        );
      }, 0);

      const existing = acc.find((cat) => cat.category === list.category);
      if (existing) {
        existing.amount += listSpent;
        existing.count += 1;
      } else {
        acc.push({
          category: list.category,
          amount: listSpent,
          count: 1,
        });
      }
      return acc;
    }, [] as Array<{ category: string; amount: number; count: number }>);

    const itemCounts = new Map<string, { count: number; totalSpent: number }>();
    shoppingLists.forEach((list) => {
      list.items.forEach((item) => {
        if (item.isPurchased) {
          const existing = itemCounts.get(item.name);
          if (existing) {
            existing.count += 1;
            existing.totalSpent += item.actualPrice || 0;
          } else {
            itemCounts.set(item.name, {
              count: 1,
              totalSpent: item.actualPrice || 0,
            });
          }
        }
      });
    });

    const mostPurchasedItems = Array.from(itemCounts.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        totalSpent: data.totalSpent,
      }))
      .sort((a, b) => b.count - a.count);

    const spendingByMonth = shoppingLists.reduce((acc, list) => {
      if (list.completedAt) {
        const month = new Date(list.completedAt).toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "long",
        });

        const listSpent = list.items.reduce((total, item) => {
          return (
            total +
            (item.isPurchased && item.actualPrice ? item.actualPrice : 0)
          );
        }, 0);

        const existing = acc.find((m) => m.month === month);
        if (existing) {
          existing.amount += listSpent;
          existing.count += 1;
        } else {
          acc.push({
            month,
            amount: listSpent,
            count: 1,
          });
        }
      }
      return acc;
    }, [] as Array<{ month: string; amount: number; count: number }>);

    const locationCounts = new Map<string, { amount: number; count: number }>();
    shoppingLists.forEach((list) => {
      if (list.location && list.isCompleted) {
        const listSpent = list.items.reduce((total, item) => {
          return (
            total +
            (item.isPurchased && item.actualPrice ? item.actualPrice : 0)
          );
        }, 0);

        const existing = locationCounts.get(list.location);
        if (existing) {
          existing.amount += listSpent;
          existing.count += 1;
        } else {
          locationCounts.set(list.location, {
            amount: listSpent,
            count: 1,
          });
        }
      }
    });

    const topLocations = Array.from(locationCounts.entries())
      .map(([location, data]) => ({
        location,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalSpent,
      totalLists: shoppingLists.length,
      completedLists: completedLists.length,
      averageListValue,
      spendingByCategory: spendingByCategory.sort(
        (a, b) => b.amount - a.amount
      ),
      mostPurchasedItems,
      spendingByMonth: spendingByMonth.sort(
        (a, b) =>
          new Date(b.month + " 1").getTime() -
          new Date(a.month + " 1").getTime()
      ),
      topLocations,
    };
  }, [shoppingLists]);
}
