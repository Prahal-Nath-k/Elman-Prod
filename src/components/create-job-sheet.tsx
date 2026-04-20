"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createJobSchema, type CreateJobInput } from "@/lib/validators";
import { createJob } from "@/lib/actions";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CreateJobSheet({ defaultDivision }: { defaultDivision?: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      reference: "",
      title: "",
      division: (defaultDivision as "MECHANICAL" | "ELECTRONIC") || "MECHANICAL",
      assignedTo: "",
      material: "",
      finish: "",
      dimensions: "",
      voltage: "",
      ampere: "",
      ipRating: "",
      panelType: "",
    } as CreateJobInput,
  });

  const onSubmit = (data: CreateJobInput) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await createJob(data);
      if (result.success) {
        setFeedback({ type: "success", message: "Job created successfully!" });
        form.reset();
        setTimeout(() => {
          setOpen(false);
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ type: "error", message: result.error });
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2" id="create-job-button">
          <Plus className="size-4" />
          New Job
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Production Job</SheetTitle>
          <SheetDescription>
            Add a new job to the production pipeline. It will start at the
            Quotation stage.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-8"
        >
          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">
              Reference <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reference"
              placeholder="e.g. JOB-2026-001"
              {...form.register("reference")}
              className={form.formState.errors.reference ? "border-destructive" : ""}
            />
            {form.formState.errors.reference && (
              <p className="text-xs text-destructive">
                {form.formState.errors.reference.message}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Custom Steel Frame Assembly"
              {...form.register("title")}
              className={form.formState.errors.title ? "border-destructive" : ""}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              placeholder="e.g. John Doe"
              {...form.register("assignedTo")}
              className={
                form.formState.errors.assignedTo ? "border-destructive" : ""
              }
            />
          </div>

          <div className="pt-4 pb-2 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {defaultDivision === "ELECTRONIC" ? "Electrical Details" : "Mechanical Details"}
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {defaultDivision === "ELECTRONIC" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="voltage">Voltage Rating</Label>
                    <Input id="voltage" placeholder="e.g. 415V" {...form.register("voltage")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ampere">Ampere Rating</Label>
                    <Input id="ampere" placeholder="e.g. 630A" {...form.register("ampere")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipRating">IP Rating</Label>
                    <Input id="ipRating" placeholder="e.g. IP54" {...form.register("ipRating")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panelType">Panel Type</Label>
                    <Input id="panelType" placeholder="e.g. Main Switchboard" {...form.register("panelType")} />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input id="material" placeholder="e.g. Mild Steel" {...form.register("material")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finish">Finish</Label>
                    <Input id="finish" placeholder="e.g. Powder Coated" {...form.register("finish")} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input id="dimensions" placeholder="e.g. 1200x800x400mm" {...form.register("dimensions")} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Create Job
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
