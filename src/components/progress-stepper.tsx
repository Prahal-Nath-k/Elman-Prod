"use client";

import { ProductionJob, ManufacturingStage, Employee } from "@/generated/prisma";
import {
  getManStageIndex,
  MANUFACTURING_STAGE_ORDER,
  getSafeManStageLabel,
} from "@/lib/production-status";
import { Check, CircleDot, ShieldCheck, ClipboardCheck } from "lucide-react";
import { AdvanceManStageButton } from "./advance-man-stage-button";
import { InspectionApprovalForm } from "./inspection-approval-form";
import { StageMaterials } from "./stage-materials";
import { JobWithRelations } from "@/lib/actions";

interface ProgressStepperProps {
  job: JobWithRelations;
  currentUser: Employee;
}

export function ProgressStepper({ job, currentUser }: ProgressStepperProps) {
  const currentIndex = getManStageIndex(job.currentStage);
  const role = currentUser.role;
  const canAdvanceStage = ["ADMIN", "OWNER", "PURCHASE_HEAD", "STORE", "SUPERVISOR"].includes(role);

  // Check current stage gate status
  const currentStageInspected = job.inspections.some(
    (i) => i.stage === job.currentStage && i.status === "PASSED"
  );
  const currentStageApproved = job.approvals.some(
    (a) => a.stage === job.currentStage
  );
  const isGated = !currentStageInspected || !currentStageApproved;

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="relative border-l ml-4 border-muted/60 space-y-12">
        {/* Background active line */}
        <div 
          className="absolute left-[-1px] top-0 w-[2px] bg-primary transition-all duration-700 ease-in-out z-0"
          style={{ height: `${(currentIndex / (MANUFACTURING_STAGE_ORDER.length - 1)) * 100}%` }}
        />

        {MANUFACTURING_STAGE_ORDER.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          
          const stageInspected = job.inspections.some(i => i.stage === stage && i.status === "PASSED");
          const stageApproved = job.approvals.some(a => a.stage === stage);
          const stageMaterials = job.materials.filter(m => m.stageRequired === stage);

          return (
            <div key={stage} className="relative pl-8">
              {/* Timeline Dot */}
              <div
                className={`
                  absolute -left-[17px] top-1 size-8 rounded-full flex items-center justify-center border-2 border-background z-10 
                  transition-all duration-300
                  ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                  ${isCurrent ? "bg-background border-primary text-primary flex-col ring-4 ring-primary/20" : ""}
                  ${isFuture ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : isCurrent ? (
                  <CircleDot className="size-4" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <h3 className={`font-semibold text-lg ${isCurrent ? "text-primary" : (isFuture ? "text-muted-foreground" : "")}`}>
                    {getSafeManStageLabel(stage, job.division as "MECHANICAL" | "ELECTRONIC")}
                  </h3>
                  {isCurrent && <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>}
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium">
                  {stageInspected && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"><ClipboardCheck className="size-3.5" /> Inspected</span>}
                  {stageApproved && <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100"><ShieldCheck className="size-3.5" /> Approved</span>}
                </div>
              </div>

              {/* Active Stage Details (Side-by-side controls and materials) */}
              {isCurrent && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6 p-5 border rounded-xl bg-card shadow-sm mb-4">
                  <div className="space-y-6">
                    <InspectionApprovalForm 
                      jobId={job.id}
                      stage={job.currentStage}
                      division={job.division as "MECHANICAL" | "ELECTRONIC"}
                      currentUser={currentUser}
                      hasInspection={currentStageInspected}
                      hasApproval={currentStageApproved}
                    />
                    
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <p className="text-xs text-muted-foreground font-medium text-center">
                        {isGated 
                          ? "Complete current gate to advance" 
                          : `Ready to move to Stage ${currentIndex + 2}`}
                      </p>
                      {canAdvanceStage && (
                        <AdvanceManStageButton 
                          job={job} 
                          supervisorId={currentUser.id}
                          isGated={isGated}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <StageMaterials 
                      jobId={job.id}
                      stage={stage}
                      materials={stageMaterials}
                      currentUser={currentUser}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
