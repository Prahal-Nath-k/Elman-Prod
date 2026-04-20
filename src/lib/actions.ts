"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createJobSchema,
  assignEmployeeSchema,
  advanceJobSchema,
  inspectionSchema,
  approvalSchema,
  advanceManStageSchema,
  type CreateJobInput,
  type AssignEmployeeInput,
  type AdvanceJobInput,
  type InspectionInput,
  type ApprovalInput,
  type AdvanceManStageInput,
  addJobMaterialSchema,
  updateMaterialStatusSchema,
  type AddJobMaterialInput,
  type UpdateMaterialStatusInput,
} from "@/lib/validators";
import {
  getNextStatus,
  validateTransition,
  getNextManStage,
  validateManStageTransition,
} from "@/lib/production-status";
import type {
  InspectionLog,
  ApprovalRecord,
  Division,
  ProductionJob,
  JobActivityLog,
  Employee,
  JobMaterial,
} from "@prisma/client";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ==========================================
// Queries
// ==========================================

export async function getJobs(division?: Division): Promise<ProductionJob[]> {
  return prisma.productionJob.findMany({
    where: division ? { division } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export type JobWithRelations = ProductionJob & {
  activityLogs: (JobActivityLog & {
    employee: Employee;
    assignedBy: Employee;
  })[];
  inspections: (InspectionLog & {
    inspector: Employee;
  })[];
  approvals: (ApprovalRecord & {
    approvedBy: Employee;
  })[];
  materials: JobMaterial[];
};

export async function getJobById(
  id: string
): Promise<JobWithRelations | null> {
  return prisma.productionJob.findUnique({
    where: { id },
    include: {
      activityLogs: {
        orderBy: { workDate: "desc" },
        include: {
          employee: true,
          assignedBy: true,
        },
      },
      inspections: {
        orderBy: { createdAt: "desc" },
        include: {
          inspector: true,
        },
      },
      approvals: {
        orderBy: { approvedAt: "desc" },
        include: {
          approvedBy: true,
        },
      },
      materials: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getEmployees(): Promise<Employee[]> {
  return prisma.employee.findMany({
    orderBy: { name: "asc" },
  });
}

// ==========================================
// Mutations
// ==========================================

export async function createJob(
  input: CreateJobInput
): Promise<ActionResult<ProductionJob>> {
  const parsed = createJobSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const job = await prisma.productionJob.create({
      data: {
        reference: parsed.data.reference,
        title: parsed.data.title,
        division: parsed.data.division,
        assignedTo: parsed.data.assignedTo || null,
        material: parsed.data.material || null,
        finish: parsed.data.finish || null,
        dimensions: parsed.data.dimensions || null,
        voltage: parsed.data.voltage || null,
        ampere: parsed.data.ampere || null,
        ipRating: parsed.data.ipRating || null,
        panelType: parsed.data.panelType || null,
      },
    });

    revalidatePath(`/${job.division.toLowerCase()}`);
    return { success: true, data: job };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return {
        success: false,
        error: "A job with this reference already exists.",
      };
    }
    return { success: false, error: "Failed to create job. Please try again." };
  }
}

export async function advanceJobStatus(
  input: AdvanceJobInput
): Promise<ActionResult<ProductionJob>> {
  const parsed = advanceJobSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input data." };
  }

  try {
    // 1. Fetch employee
    const supervisor = await prisma.employee.findUnique({
      where: { id: parsed.data.supervisorId },
    });

    if (!supervisor) {
      return { success: false, error: "Unauthorized: Employee not found." };
    }

    // 2. Fetch current job state
    const job = await prisma.productionJob.findUnique({
      where: { id: parsed.data.jobId },
    });

    if (!job) {
      return { success: false, error: "Job not found." };
    }

    // 3. Determine next status
    const nextStatus = getNextStatus(job.status);
    if (!nextStatus) {
      return {
        success: false,
        error: `Job is already at the final stage (${job.status}).`,
      };
    }

    // 4. Authorization Check
    const { role } = supervisor;
    if (role === "STAFF" || role === "STORE") {
      return { success: false, error: "Unauthorized: Role cannot advance general job status." };
    }
    
    if (role === "MECH_HEAD" || role === "ELEC_HEAD") {
      if (nextStatus !== "PURCHASE_ORDER" && nextStatus !== "PURCHASE_MATERIAL") {
        return { success: false, error: "Unauthorized: Role can only advance to purchase intent statuses." };
      }
    }

    // 4. Strict Validation: Enforce linear state machine
    try {
      validateTransition(job.status, nextStatus);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Invalid state transition",
      };
    }

    // 5. Update
    const updatedJob = await prisma.productionJob.update({
      where: { id: job.id },
      data: { status: nextStatus },
    });

    revalidatePath(`/${updatedJob.division.toLowerCase()}`);
    revalidatePath(`/jobs/${job.id}`);
    return { success: true, data: updatedJob };
  } catch {
    return {
      success: false,
      error: "Failed to advance job status. Please try again.",
    };
  }
}

export async function assignEmployeeToJob(
  input: AssignEmployeeInput & { assignedById: string }
): Promise<ActionResult<JobActivityLog[]>> {
  const parsedSchema = assignEmployeeSchema.safeParse(input);
  if (!parsedSchema.success) {
    return { success: false, error: "Invalid input data." };
  }

  const { jobId, employeeIds, workDate, description } = parsedSchema.data;
  const { assignedById } = input;

  try {
    // 1. Authorization check
    const supervisor = await prisma.employee.findUnique({
      where: { id: assignedById },
    });

    if (!supervisor) return { success: false, error: "Employee not found." };
    const allowedToAssign = ["ADMIN", "OWNER", "PURCHASE_HEAD", "STORE", "SUPERVISOR"];
    if (!allowedToAssign.includes(supervisor.role)) {
      return {
        success: false,
        error: "Unauthorized: Role cannot assign staff.",
      };
    }

    // 2. Verify job
    const job = await prisma.productionJob.findUnique({ where: { id: jobId } });
    if (!job) return { success: false, error: "Job not found." };

    // 3. Verify all employees
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
    });

    if (employees.length !== employeeIds.length) {
      return { success: false, error: "One or more employees not found." };
    }

    // 4. Create Daily Assignments (Audit Logs) in a transaction
    const activityLogs = await prisma.$transaction(
      employeeIds.map((empId) =>
        prisma.jobActivityLog.create({
          data: {
            jobId,
            stage: job.status,
            manufacturingStage: job.status === "MANUFACTURING" ? job.currentStage : null,
            employeeId: empId,
            assignedById,
            workDate,
            description: description || null,
          },
        })
      )
    );

    // 5. Update the current "assignedTo" on the job for quick UI reference
    // Show names for up to 3 employees, then use "X others"
    const assignedNames = employees.map(e => e.name);
    let summaryText = "";
    if (assignedNames.length <= 3) {
      summaryText = assignedNames.join(", ");
    } else {
      summaryText = `${assignedNames.slice(0, 2).join(", ")} +${assignedNames.length - 2} more`;
    }

    await prisma.productionJob.update({
      where: { id: jobId },
      data: { assignedTo: summaryText },
    });

    revalidatePath(`/${job.division.toLowerCase()}`);
    revalidatePath(`/jobs/${jobId}`);
    return { success: true, data: activityLogs };
  } catch (error: any) {
    console.error("Assignment error:", error);
    return {
      success: false,
      error: error.message || "Failed to create assignment logs. Please try again.",
    };
  }
}

// ==========================================
// Manufacturing Workflow Mutations
// ==========================================

export async function submitInspection(
  input: InspectionInput
): Promise<ActionResult<InspectionLog>> {
  const parsed = inspectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid inspection data." };
  }

  try {
    const inspector = await prisma.employee.findUnique({
      where: { id: parsed.data.inspectorId },
    });

    if (!inspector) return { success: false, error: "Inspector not found." };
    const allowedToInspect = ["ADMIN", "OWNER", "PURCHASE_HEAD", "STORE", "SUPERVISOR"];
    if (!allowedToInspect.includes(inspector.role)) {
      return {
        success: false,
        error: "Unauthorized: Role cannot record inspections.",
      };
    }

    const inspection = await prisma.inspectionLog.create({
      data: {
        jobId: parsed.data.jobId,
        stage: parsed.data.stage,
        status: parsed.data.status,
        notes: parsed.data.notes || null,
        inspectorId: parsed.data.inspectorId,
      },
    });

    revalidatePath(`/jobs/${parsed.data.jobId}`);
    return { success: true, data: inspection };
  } catch (error) {
    console.error("Inspection error:", error);
    return { success: false, error: "Failed to record inspection." };
  }
}

export async function approveStage(
  input: ApprovalInput
): Promise<ActionResult<ApprovalRecord>> {
  const parsed = approvalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid approval data." };
  }

  try {
    const approver = await prisma.employee.findUnique({
      where: { id: parsed.data.approverId },
    });

    if (!approver) return { success: false, error: "Approver not found." };
    const allowedToApprove = ["ADMIN", "OWNER", "PURCHASE_HEAD"];
    if (!allowedToApprove.includes(approver.role)) {
      return {
        success: false,
        error: "Unauthorized: Only admins/owners/purchase heads can approve stages.",
      };
    }

    // Ensure there is a passed inspection for this stage
    const inspection = await prisma.inspectionLog.findFirst({
      where: {
        jobId: parsed.data.jobId,
        stage: parsed.data.stage,
        status: "PASSED",
      },
    });

    if (!inspection) {
      return {
        success: false,
        error: "Cannot approve: Stage must have a 'PASSED' inspection record.",
      };
    }

    const approval = await prisma.approvalRecord.create({
      data: {
        jobId: parsed.data.jobId,
        stage: parsed.data.stage,
        approvedById: parsed.data.approverId,
      },
    });

    revalidatePath(`/jobs/${parsed.data.jobId}`);
    return { success: true, data: approval };
  } catch (error) {
    console.error("Approval error:", error);
    return { success: false, error: "Failed to record approval." };
  }
}

export async function advanceManufacturingStage(
  input: AdvanceManStageInput
): Promise<ActionResult<ProductionJob>> {
  const parsed = advanceManStageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input data." };
  }

  try {
    // 1. Authorization check
    const supervisor = await prisma.employee.findUnique({
      where: { id: parsed.data.supervisorId },
    });

    if (!supervisor) return { success: false, error: "Supervisor not found." };
    const allowedToAdvanceStage = ["ADMIN", "OWNER", "PURCHASE_HEAD", "STORE", "SUPERVISOR"];
    if (!allowedToAdvanceStage.includes(supervisor.role)) {
      return {
        success: false,
        error: "Unauthorized: Role cannot advance manufacturing stages.",
      };
    }

    // 2. Fetch current job state
    const job = await prisma.productionJob.findUnique({
      where: { id: parsed.data.jobId },
      include: {
        inspections: true,
        approvals: true,
      },
    });

    if (!job) return { success: false, error: "Job not found." };

    // 3. Determine next stage
    const nextStage = getNextManStage(job.currentStage);
    if (!nextStage) {
      // If at DISPATCH, check if we can move to COMPLETED status
      const isDispatchApproved = job.approvals.some(a => a.stage === "DISPATCH");
      if (isDispatchApproved) {
        const updatedJob = await prisma.productionJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED" },
        });
        revalidatePath(`/${updatedJob.division.toLowerCase()}`);
        revalidatePath(`/jobs/${job.id}`);
        return { success: true, data: updatedJob };
      }
      return { success: false, error: "Job has reached the final manufacturing stage." };
    }

    // 4. Validate transition (Gate check)
    const isInspected = job.inspections.some(i => i.stage === job.currentStage && i.status === "PASSED");
    const isApproved = job.approvals.some(a => a.stage === job.currentStage);

    try {
      validateManStageTransition(job.currentStage, nextStage, isInspected, isApproved);
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Invalid transition" };
    }

    // 5. Update
    const updatedJob = await prisma.productionJob.update({
      where: { id: job.id },
      data: { currentStage: nextStage },
    });

    revalidatePath("/");
    revalidatePath(`/jobs/${job.id}`);
    revalidatePath(`/${updatedJob.division.toLowerCase()}`);
    return { success: true, data: updatedJob };
  } catch (error) {
    console.error("Advance stage error:", error);
    return { success: false, error: "Failed to advance manufacturing stage." };
  }
}

// ==========================================
// Material Management
// ==========================================

export async function addJobMaterial(
  input: AddJobMaterialInput,
  employeeId: string
): Promise<ActionResult<JobMaterial>> {
  const parsed = addJobMaterialSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid material data." };

  try {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return { success: false, error: "Employee not found." };
    
    // Only Admin, Owner, and Purchase Head can add materials during the PO phase
    const allowed = ["ADMIN", "OWNER", "PURCHASE_HEAD"];
    if (!allowed.includes(employee.role)) {
      return { success: false, error: "Unauthorized: Role cannot add project materials." };
    }

    const material = await prisma.jobMaterial.create({
      data: {
        jobId: parsed.data.jobId,
        name: parsed.data.name,
        quantity: parsed.data.quantity,
        stageRequired: parsed.data.stageRequired,
        status: "AVAILABLE", // Default setup from PO
      },
    });

    revalidatePath(`/jobs/${parsed.data.jobId}`);
    return { success: true, data: material };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add material." };
  }
}

export async function updateMaterialStatus(
  input: UpdateMaterialStatusInput,
  employeeId: string
): Promise<ActionResult<JobMaterial>> {
  const parsed = updateMaterialStatusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid material data." };

  try {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return { success: false, error: "Employee not found." };
    
    const material = await prisma.jobMaterial.findUnique({ where: { id: parsed.data.materialId } });
    if (!material) return { success: false, error: "Material not found." };

    const { role } = employee;
    const { status } = parsed.data;

    // Rules for requesting vs procuring
    if (status === "REQUESTED") {
      // Anyone except STAFF can raise a request (including MECH_HEAD/ELEC_HEAD)
      if (role === "STAFF") return { success: false, error: "Staff cannot request materials." };
    } else if (status === "AVAILABLE") {
      // Only Admin, Owner, Purchase Head, or Store can mark as procured/available
      const allowed = ["ADMIN", "OWNER", "PURCHASE_HEAD", "STORE"];
      if (!allowed.includes(role)) {
        return { success: false, error: "Unauthorized: Role cannot mark materials as available." };
      }
    }

    const updatedMaterial = await prisma.jobMaterial.update({
      where: { id: material.id },
      data: { status },
    });

    revalidatePath(`/jobs/${material.jobId}`);
    return { success: true, data: updatedMaterial };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update material status." };
  }
}

