"use client";

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number, key: string | number | undefined) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs shadow-[var(--shadow-card-hover)]">
      {label && <div className="mb-1.5 font-medium text-text">{label}</div>}
      <div className="flex flex-col gap-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-text-muted">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}:</span>
            <span className="font-medium tabular-nums text-text">
              {typeof item.value === "number"
                ? (formatter?.(item.value, item.dataKey) ?? item.value.toLocaleString())
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
