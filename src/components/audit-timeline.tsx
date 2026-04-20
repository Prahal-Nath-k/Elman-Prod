"use client";

import { JobWithRelations } from "@/lib/actions";
import { getSafeManStageLabel, getSafeStatusLabel } from "@/lib/production-status";
import { format } from "date-fns";
import { User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface AuditTimelineProps {
  logs: JobWithRelations["activityLogs"];
  division: "MECHANICAL" | "ELECTRONIC";
}

export function AuditTimeline({ logs, division }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        No activities recorded for this job yet.
      </div>
    );
  }

  // Group logs by common attributes (stage, workDate, description, supervisor)
  const groupedLogs = logs.reduce((acc: Record<string, any>, log: any) => {
    const key = `${log.stage}-${format(new Date(log.workDate), "yyyy-MM-dd")}-${log.description}-${log.assignedById}`;
    if (!acc[key]) {
      acc[key] = {
        ...log,
        employees: [log.employee],
      };
    } else {
      acc[key].employees.push(log.employee);
    }
    return acc;
  }, {} as Record<string, any>);

  const timelineItems: any[] = Object.values(groupedLogs).sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1 mb-6">
        <h3 className="font-medium text-sm">Audit Trail</h3>
        <p className="text-xs text-muted-foreground">
          Chronological history of work assignments and state transitions.
        </p>
      </div>

      <div className="relative border-l ml-3 border-muted space-y-8">
        {timelineItems.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="relative pl-8"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
              <span className="font-semibold text-sm">
                Stage: {log.manufacturingStage 
                  ? getSafeManStageLabel(log.manufacturingStage, division) 
                  : getSafeStatusLabel(log.stage)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums font-medium">
                {format(new Date(log.workDate), "MMM do, yyyy")}
              </span>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <User className="size-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    {log.employees.map((emp: any, idx: number) => (
                      <span key={emp.id} className="text-sm font-medium leading-none">
                        {emp.name}{idx < log.employees.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assigned Task
                  </p>
                  {log.description && (
                    <p className="text-sm mt-2 text-foreground/80 italic border-l-2 border-primary/30 pl-2">
                      &quot;{log.description}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-600/70 dark:text-emerald-500/70">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none flex items-center gap-2">
                    {log.assignedBy.name}
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-sm font-semibold">
                      Authorized By
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 tabular-nums">
                    Logged: {format(new Date(log.createdAt), "PPp")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
