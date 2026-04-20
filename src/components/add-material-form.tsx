"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addJobMaterialSchema, type AddJobMaterialInput } from "@/lib/validators";
import { addJobMaterial } from "@/lib/actions";
import { getSafeManStageLabel, MANUFACTURING_STAGE_ORDER } from "@/lib/production-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Employee, ProductionJob, ManufacturingStage } from "@prisma/client";

interface AddMaterialFormProps {
  job: ProductionJob;
  currentUser: Employee;
}

export function AddMaterialForm({ job, currentUser }: AddMaterialFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddJobMaterialInput>({
    resolver: zodResolver(addJobMaterialSchema),
    defaultValues: {
      jobId: job.id,
      name: "",
      quantity: 1,
      stageRequired: MANUFACTURING_STAGE_ORDER[0],
    },
  });

  const canAdd = ["ADMIN", "OWNER", "PURCHASE_HEAD"].includes(currentUser.role);
  
  if (!canAdd) return null;

  const onSubmit = (data: AddJobMaterialInput) => {
    startTransition(async () => {
      const result = await addJobMaterial(data, currentUser.id);
      if (result.success) {
        toast.success("Material added successfully");
        form.reset({ ...data, name: "", quantity: 1 });
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold">Project Material Setup</CardTitle>
            <CardDescription className="text-xs">
              Define the materials required for this job (typically during Purchase Order).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row items-start gap-4">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Material Name</label>
            <Input 
              placeholder="e.g., 2mm Steel Sheet" 
              {...form.register("name")} 
            />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>

          <div className="w-full md:w-24 space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Qty</label>
            <Input 
              type="number" 
              min={1} 
              {...form.register("quantity", { valueAsNumber: true })} 
            />
            {form.formState.errors.quantity && <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>}
          </div>

          <div className="w-full md:w-64 space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Stage Needed</label>
            <Select 
              value={form.watch("stageRequired")} 
              onValueChange={(val: ManufacturingStage) => form.setValue("stageRequired", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Stage" />
              </SelectTrigger>
              <SelectContent>
                {MANUFACTURING_STAGE_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {getSafeManStageLabel(s, job.division as "MECHANICAL" | "ELECTRONIC")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.stageRequired && <p className="text-xs text-destructive">{form.formState.errors.stageRequired.message}</p>}
          </div>

          <div className="pt-6 w-full md:w-auto">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
              Add
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
