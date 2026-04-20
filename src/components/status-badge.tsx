"use client";

import { Badge } from "@/components/ui/badge";
import { ProductionStatus } from "@/generated/prisma";
import { getSafeStatusLabel } from "@/lib/production-status";

const DEFAULT_CONFIG = {
  className: "bg-muted text-muted-foreground border-muted-foreground/20",
  dotColor: "bg-muted-foreground",
};

const statusConfig: Record<
  string,
  { className: string; dotColor: string }
> = {
  QUOTATION: {
    className:
      "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400 dark:bg-sky-500/15 dark:border-sky-500/25",
    dotColor: "bg-sky-500",
  },
  PURCHASE_ORDER: {
    className:
      "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400 dark:bg-violet-500/15 dark:border-violet-500/25",
    dotColor: "bg-violet-500",
  },
  DESIGN: {
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-500/25",
    dotColor: "bg-amber-500",
  },
  PURCHASE_MATERIAL: {
    className:
      "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400 dark:bg-orange-500/15 dark:border-orange-500/25",
    dotColor: "bg-orange-500",
  },
  MANUFACTURING: {
    className:
      "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400 dark:bg-indigo-500/15 dark:border-indigo-500/25",
    dotColor: "bg-indigo-500",
  },
  COMPLETED: {
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-500/25",
    dotColor: "bg-emerald-500",
  },
  SHIPPED: {
    className:
      "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400 dark:bg-slate-500/15 dark:border-slate-500/25",
    dotColor: "bg-slate-500",
  },
};

interface StatusBadgeProps {
  status: string; // Use string for robustness against legacy DB data
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || DEFAULT_CONFIG;
  // The original line `const label = STATUS_LABELS[status as ProductionStatus] || status;` is removed
  // as `getSafeStatusLabel` already handles the label lookup.

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 font-medium text-xs px-2.5 py-0.5 ${config.className}`}
    >
      <span
        className={`size-1.5 rounded-full ${config.dotColor}`}
        aria-hidden="true"
      />
      {getSafeStatusLabel(status)}
    </Badge>
  );
}
