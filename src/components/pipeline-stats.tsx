"use client";

import { ProductionStatus } from "@prisma/client";
import { PRODUCTION_STATUS_ORDER, getSafeStatusLabel } from "@/lib/production-status";
import { StatusBadge } from "@/components/status-badge";
import type { ProductionJob } from "@prisma/client";

interface PipelineStatsProps {
  jobs: ProductionJob[];
}

export function PipelineStats({ jobs }: PipelineStatsProps) {
  const countByStatus = PRODUCTION_STATUS_ORDER.map((status) => ({
    status,
    count: jobs.filter((j) => j.status === status).length,
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {countByStatus.map(({ status, count }) => (
        <div
          key={status}
          className="rounded-lg border bg-card p-4 flex flex-col gap-2"
        >
          <StatusBadge status={status} />
          <span className="text-2xl font-bold tabular-nums">{count}</span>
          <span className="text-xs text-muted-foreground">
            {getSafeStatusLabel(status)}
          </span>
        </div>
      ))}
    </div>
  );
}
