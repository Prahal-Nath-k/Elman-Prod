"use client";

import { useState, useTransition } from "react";
import { AdvanceJobInput } from "@/lib/validators";
import { advanceJobStatus } from "@/lib/actions";
import { getNextStatus, isFinalStatus, getSafeStatusLabel } from "@/lib/production-status";
import { ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductionJob, Employee } from "@prisma/client";

interface AdvanceStatusButtonProps {
  job: ProductionJob;
  currentUser?: Employee;
}

export function AdvanceStatusButton({
  job,
  currentUser,
}: AdvanceStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const supervisorId = currentUser?.id || "emp-sup-001";
  const role = currentUser?.role || "STAFF";

  if (isFinalStatus(job.status)) {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="size-3.5" />
        Complete
      </span>
    );
  }

  const nextStatus = getNextStatus(job.status);
  
  if (role === "STAFF" || role === "STORE") return null;
  if (role === "MECH_HEAD" || role === "ELEC_HEAD") {
    if (nextStatus !== "PURCHASE_ORDER" && nextStatus !== "PURCHASE_MATERIAL") return null;
  }

  const handleAdvance = () => {
    startTransition(async () => {
      const payload: AdvanceJobInput = {
        jobId: job.id,
        supervisorId,
      };
      
      const result = await advanceJobStatus(payload);
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert(result.error); // Basic error handling for Phase 2 constraint failure
      }
    });
  };

  return (
    <AnimatePresence mode="wait">
      {showSuccess ? (
        <motion.span
          key="success"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-emerald-600 dark:text-emerald-400 text-xs font-medium flex my-1.5"
        >
          Advanced to {getSafeStatusLabel(nextStatus)} ✓
        </motion.span>
      ) : (
        <motion.div
          key="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdvance}
            disabled={isPending}
            className="text-xs gap-2"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                Advance to {getSafeStatusLabel(nextStatus)}
                <ChevronRight className="size-3.5" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
