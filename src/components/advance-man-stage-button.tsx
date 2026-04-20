"use client";

import { useTransition, useState } from "react";
import { AdvanceManStageInput } from "@/lib/validators";
import { advanceManufacturingStage } from "@/lib/actions";
import { getNextManStage, getSafeManStageLabel } from "@/lib/production-status";
import { ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductionJob } from "@prisma/client";
import { toast } from "sonner";

interface AdvanceManStageButtonProps {
  job: ProductionJob;
  supervisorId: string;
  isGated: boolean;
}

export function AdvanceManStageButton({
  job,
  supervisorId,
  isGated,
}: AdvanceManStageButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  const nextStage = getNextManStage(job.currentStage);

  const handleAdvance = () => {
    if (isGated) {
      toast.error("Cannot advance: Inspection and Approval required for current stage.");
      return;
    }

    startTransition(async () => {
      const payload: AdvanceManStageInput = {
        jobId: job.id,
        supervisorId,
      };
      
      const result = await advanceManufacturingStage(payload);
      
      if (result.success) {
        setShowSuccess(true);
        toast.success(`Advanced to ${getSafeManStageLabel(nextStage, job.division as "MECHANICAL" | "ELECTRONIC")}`);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        toast.error(result.error);
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
          Stage Advanced ✓
        </motion.span>
      ) : (
        <motion.div
          key="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Button
            variant="default"
            size="sm"
            onClick={handleAdvance}
            disabled={isPending || isGated}
            className={`text-xs gap-2 ${isGated ? "opacity-50 grayscale" : "bg-primary shadow-lg shadow-primary/20"}`}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                Next Stage: {getSafeManStageLabel(nextStage, job.division as "MECHANICAL" | "ELECTRONIC")}
                <ChevronRight className="size-3.5" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
