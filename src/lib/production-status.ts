import { ProductionStatus, ManufacturingStage } from "@prisma/client";

/**
 * Ordered list of production statuses representing the high-level pipeline.
 */
export const PRODUCTION_STATUS_ORDER: readonly ProductionStatus[] = [
  "QUOTATION",
  "PURCHASE_ORDER",
  "DESIGN",
  "PURCHASE_MATERIAL",
  "MANUFACTURING",
  "COMPLETED",
  "SHIPPED",
] as const;

/**
 * Ordered list of manufacturing stages representing the granular 10-stage workflow.
 */
export const MANUFACTURING_STAGE_ORDER: readonly ManufacturingStage[] = [
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
] as const;

/** Human-readable labels for each production status */
export const STATUS_LABELS: Record<string, string> = {
  QUOTATION: "Quotation",
  PURCHASE_ORDER: "Purchase Order",
  DESIGN: "Design",
  PURCHASE_MATERIAL: "Purchase Material",
  MANUFACTURING: "Manufacturing",
  COMPLETED: "Completed",
  SHIPPED: "Shipped",
};

/** Human-readable labels for each manufacturing stage, split by division */
export const MAN_STAGE_LABELS: Record<"MECHANICAL" | "ELECTRONIC", Record<ManufacturingStage, string>> = {
  MECHANICAL: {
    MATERIAL_CUTTING: "Material Cutting",
    BENDING: "Bending",
    WELDING: "Welding",
    MACHINING: "Machining",
    GRINDING_CLEANING: "Grinding/Cleaning",
    ASSEMBLY: "Assembly",
    PAINTING_COATING: "Painting/Coating",
    QUALITY_TESTING: "Quality Testing",
    PACKING: "Packing",
    DISPATCH: "Dispatch",
  },
  ELECTRONIC: {
    MATERIAL_CUTTING: "Sheet Metal & Fab",
    BENDING: "Powder Coating",
    WELDING: "Outsourcing",
    MACHINING: "Assembly Prep",
    GRINDING_CLEANING: "Infrastructure Install",
    ASSEMBLY: "Component Install",
    PAINTING_COATING: "Wiring & Tagging",
    QUALITY_TESTING: "Labelling & Plates",
    PACKING: "Testing & Commissioning",
    DISPATCH: "Dispatch",
  },
};

export function getStatusIndex(status: string | null | undefined): number {
  if (!status) return -1;
  return PRODUCTION_STATUS_ORDER.indexOf(status as any);
}

export function getManStageIndex(stage: string | null | undefined): number {
  if (!stage) return -1;
  return MANUFACTURING_STAGE_ORDER.indexOf(stage as any);
}

export function getNextStatus(current: ProductionStatus): ProductionStatus | null {
  const currentIndex = getStatusIndex(current);
  if (currentIndex === -1 || currentIndex >= PRODUCTION_STATUS_ORDER.length - 1) {
    return null;
  }
  return PRODUCTION_STATUS_ORDER[currentIndex + 1];
}

export function getNextManStage(current: ManufacturingStage): ManufacturingStage | null {
  const currentIndex = getManStageIndex(current);
  if (currentIndex === -1 || currentIndex >= MANUFACTURING_STAGE_ORDER.length - 1) {
    return null;
  }
  return MANUFACTURING_STAGE_ORDER[currentIndex + 1];
}

export function validateTransition(
  current: ProductionStatus,
  target: ProductionStatus
): void {
  const currentIndex = getStatusIndex(current);
  const targetIndex = getStatusIndex(target);

  if (currentIndex === -1 || targetIndex === -1) {
    throw new Error("Invalid status provided");
  }

  if (targetIndex !== currentIndex + 1) {
    throw new Error(
      `Invalid transition: Cannot move from ${STATUS_LABELS[current]} to ${STATUS_LABELS[target]}. Steps must be strictly sequential.`
    );
  }
}

export function validateManStageTransition(
  current: ManufacturingStage,
  target: ManufacturingStage,
  isInspected: boolean,
  isApproved: boolean
): void {
  const currentIndex = getManStageIndex(current);
  const targetIndex = getManStageIndex(target);

  if (currentIndex === -1 || targetIndex === -1) {
    throw new Error("Invalid stage provided");
  }

  if (targetIndex !== currentIndex + 1) {
    throw new Error(
      `Invalid transition: Cannot move from ${getSafeManStageLabel(current)} to ${getSafeManStageLabel(target)}. Stages must be strictly sequential.`
    );
  }

  if (!isInspected) {
    throw new Error(`Cannot advance: Stage ${getSafeManStageLabel(current)} must pass inspection first.`);
  }

  if (!isApproved) {
    throw new Error(`Cannot advance: Stage ${getSafeManStageLabel(current)} must be approved by a manager.`);
  }
}
/**
 * Checks if a status is the final stage of the high-level pipeline.
 */
export function isFinalStatus(status: ProductionStatus): boolean {
  return (status as string) === "SHIPPED";
}

/**
 * Safely get a label for a production status, falling back to the status string itself.
 */
export function getSafeStatusLabel(status: string | null | undefined): string {
  if (!status) return "N/A";
  return STATUS_LABELS[status] || status;
}

/**
 * Safely get a label for a manufacturing stage, falling back to the stage string itself.
 * Now requires division context to provide specific terminology.
 */
export function getSafeManStageLabel(
  stage: string | null | undefined,
  division?: "MECHANICAL" | "ELECTRONIC"
): string {
  if (!stage) return "N/A";
  const div = division || "MECHANICAL";
  return MAN_STAGE_LABELS[div]?.[stage as ManufacturingStage] || stage;
}
