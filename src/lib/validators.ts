import { z } from "zod";
import { ManufacturingStage, InspectionStatus } from "@prisma/client";

export const createJobSchema = z.object({
  reference: z
    .string()
    .min(1, "Reference is required")
    .max(50, "Reference must be 50 characters or fewer")
    .regex(
      /^[A-Za-z0-9\-_]+$/,
      "Reference must contain only letters, numbers, hyphens, and underscores"
    ),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  division: z.enum(["MECHANICAL", "ELECTRONIC"]),
  assignedTo: z
    .string()
    .max(100, "Assigned To must be 100 characters or fewer")
    .optional()
    .or(z.literal("")),
  // New division-specific fields
  material: z.string().optional().or(z.literal("")),
  finish: z.string().optional().or(z.literal("")),
  dimensions: z.string().optional().or(z.literal("")),
  voltage: z.string().optional().or(z.literal("")),
  ampere: z.string().optional().or(z.literal("")),
  ipRating: z.string().optional().or(z.literal("")),
  panelType: z.string().optional().or(z.literal("")),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const assignEmployeeSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  employeeIds: z.array(z.string().uuid("Invalid employee ID")).min(1, "Select at least one employee"),
  workDate: z.date({ message: "A work date is required" }),
  description: z.string().max(500, "Description must be 500 characters or fewer").optional().or(z.literal("")),
});

export type AssignEmployeeInput = z.infer<typeof assignEmployeeSchema>;

export const advanceJobSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  supervisorId: z.string().uuid("Invalid supervisor ID"),
});

export type AdvanceJobInput = z.infer<typeof advanceJobSchema>;

export const inspectionSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  inspectorId: z.string().uuid("Invalid inspector ID"),
  stage: z.enum([
    "MATERIAL_CUTTING",
    "BENDING",
    "WELDING",
    "MACHINING",
    "GRINDING_CLEANING",
    "ASSEMBLY",
    "PAINTING_COATING",
    "QUALITY_TESTING",
    "PACKING",
    "DISPATCH",
  ]),
  status: z.enum(["PENDING", "PASSED", "FAILED"]),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type InspectionInput = z.infer<typeof inspectionSchema>;

export const approvalSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  approverId: z.string().uuid("Invalid approver ID"),
  stage: z.enum([
    "MATERIAL_CUTTING",
    "BENDING",
    "WELDING",
    "MACHINING",
    "GRINDING_CLEANING",
    "ASSEMBLY",
    "PAINTING_COATING",
    "QUALITY_TESTING",
    "PACKING",
    "DISPATCH",
  ]),
});

export type ApprovalInput = z.infer<typeof approvalSchema>;

export const advanceManStageSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  supervisorId: z.string().uuid("Invalid supervisor ID"),
});

export type AdvanceManStageInput = z.infer<typeof advanceManStageSchema>;

export const addJobMaterialSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  name: z.string().min(1, "Name is required").max(100),
  quantity: z.number().int().min(1),
  stageRequired: z.enum([
    "MATERIAL_CUTTING",
    "BENDING",
    "WELDING",
    "MACHINING",
    "GRINDING_CLEANING",
    "ASSEMBLY",
    "PAINTING_COATING",
    "QUALITY_TESTING",
    "PACKING",
    "DISPATCH",
  ]),
});
export type AddJobMaterialInput = z.infer<typeof addJobMaterialSchema>;

export const updateMaterialStatusSchema = z.object({
  materialId: z.string().uuid("Invalid material ID"),
  status: z.enum(["PENDING", "REQUESTED", "AVAILABLE"]),
});
export type UpdateMaterialStatusInput = z.infer<typeof updateMaterialStatusSchema>;
