export type MetricFormat = "currency" | "percent" | "number" | "duration-days";

export function formatMetric(value: number, format: MetricFormat): string {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
    case "percent":
      return new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: 1,
      }).format(value);
    case "duration-days":
      return `${value.toFixed(1)}d`;
    case "number":
    default:
      return new Intl.NumberFormat("en-US").format(Math.round(value));
  }
}

export function formatDelta(deltaPct: number): string {
  const sign = deltaPct > 0 ? "+" : "";
  return `${sign}${deltaPct.toFixed(1)}%`;
}
