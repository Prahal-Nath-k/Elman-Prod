"use client";

import { useTransition } from "react";
import { ManufacturingStage, InspectionStatus, Employee } from "@/generated/prisma";
import { getSafeManStageLabel } from "@/lib/production-status";
import { submitInspection, approveStage } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, ShieldCheck, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

interface InspectionApprovalFormProps {
  jobId: string;
  stage: ManufacturingStage;
  division: "MECHANICAL" | "ELECTRONIC";
  currentUser: Employee;
  hasInspection: boolean;
  hasApproval: boolean;
}

export function InspectionApprovalForm({
  jobId,
  stage,
  division,
  currentUser,
  hasInspection,
  hasApproval,
}: InspectionApprovalFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleInspection = (status: InspectionStatus) => {
    startTransition(async () => {
      const result = await submitInspection({
        jobId,
        inspectorId: currentUser.id,
        stage,
        status,
        notes: "",
      });
      if (result.success) {
        toast.success(`Inspection recorded as ${status}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleApproval = () => {
    startTransition(async () => {
      const result = await approveStage({
        jobId,
        approverId: currentUser.id,
        stage,
      });
      if (result.success) {
        toast.success(`${getSafeManStageLabel(stage, division)} inspected successfully.`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const role = currentUser.role;
  const canInspect = ["ADMIN", "OWNER", "PURCHASE_HEAD", "STORE", "SUPERVISOR"].includes(role);
  const canApprove = ["ADMIN", "OWNER", "PURCHASE_HEAD"].includes(role);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <ClipboardCheck className="size-4 text-primary" />
          Gate: {getSafeManStageLabel(stage, division)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              1. Inspection
            </span>
            {hasInspection ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="size-3" />
                PASSED
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-600">PENDING</span>
            )}
          </div>
          {!hasInspection && canInspect && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-emerald-500/50 hover:bg-emerald-50 text-emerald-700"
                onClick={() => handleInspection("PASSED")}
                disabled={isPending}
              >
                Pass Inspection
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-red-500/50 hover:bg-red-50 text-red-700"
                onClick={() => handleInspection("FAILED")}
                disabled={isPending}
              >
                Fail
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              2. Manager Approval
            </span>
            {hasApproval ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <ShieldCheck className="size-3" />
                AUTHORIZED
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-600">WAITING</span>
            )}
          </div>
          {!hasApproval && canApprove && hasInspection && (
            <Button
              variant="default"
              size="sm"
              className="w-full h-8 text-xs bg-primary hover:bg-primary/90"
              onClick={handleApproval}
              disabled={isPending}
            >
              Authorize Stage Progression
            </Button>
          )}
          {!canApprove && !hasApproval && (
            <p className="text-[10px] text-muted-foreground italic text-center">
              Requires Manager-level authorization
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
