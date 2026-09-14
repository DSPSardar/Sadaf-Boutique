const pkr = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

/** Formats a PKR amount as "Rs 48,500". */
export function formatPKR(amount: number): string {
  return `Rs ${pkr.format(amount)}`;
}

export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
