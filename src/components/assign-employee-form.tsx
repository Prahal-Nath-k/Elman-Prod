"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assignEmployeeSchema, type AssignEmployeeInput } from "@/lib/validators";
import { assignEmployeeToJob } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import type { Employee, ProductionJob } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface AssignEmployeeFormProps {
  job: ProductionJob;
  employees: Employee[];
  currentUser: Employee;
}

export function AssignEmployeeForm({ job, employees, currentUser }: AssignEmployeeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const form = useForm<AssignEmployeeInput>({
    resolver: zodResolver(assignEmployeeSchema),
    defaultValues: {
      jobId: job.id,
      employeeIds: [],
      workDate: new Date(),
      description: "",
    },
  });

  const selectedEmployeeIds = form.watch("employeeIds");

  const toggleEmployee = (id: string) => {
    const current = form.getValues("employeeIds");
    if (current.includes(id)) {
      form.setValue("employeeIds", current.filter((i) => i !== id));
    } else {
      form.setValue("employeeIds", [...current, id]);
    }
  };

  const removeEmployee = (id: string) => {
    const current = form.getValues("employeeIds");
    form.setValue("employeeIds", current.filter((i) => i !== id));
  };

  const onSubmit = (data: AssignEmployeeInput) => {
    startTransition(async () => {
      const result = await assignEmployeeToJob({
        ...data,
        assignedById: currentUser.id, // Implicit auth context
      });

      if (result.success) {
        setSuccess(true);
        form.reset({ ...data, employeeIds: [] }); // keep date
        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.log(result.error);
      }
    });
  };

  const role = currentUser.role;
  const canAssign = ["ADMIN", "OWNER", "PURCHASE_HEAD", "STORE", "SUPERVISOR"].includes(role);

  if (!canAssign) {
    return (
      <div className="p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground">
        Only supervisors can assign daily tasks.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="font-medium text-sm">Daily Assignment</h3>
        <p className="text-xs text-muted-foreground">
          Assign personnel to work on the current stage today.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee Multi-Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Employees
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-auto min-h-10 py-2"
                >
                  <div className="flex flex-wrap gap-1">
                    {selectedEmployeeIds.length > 0 ? (
                      selectedEmployeeIds.map((id) => {
                        const emp = employees.find((e) => e.id === id);
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="text-[10px] px-1.5 h-6 gap-1"
                          >
                            {emp?.name}
                            <X
                              className="size-3 cursor-pointer hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEmployee(id);
                              }}
                            />
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-muted-foreground">Select staff...</span>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="max-h-60 overflow-y-auto p-1">
                  {employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                      onClick={() => toggleEmployee(emp.id)}
                    >
                      <Checkbox
                        id={`emp-${emp.id}`}
                        checked={selectedEmployeeIds.includes(emp.id)}
                        onCheckedChange={() => toggleEmployee(emp.id)}
                      />
                      <label
                        htmlFor={`emp-${emp.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {emp.name} ({emp.role.toLowerCase()})
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {form.formState.errors.employeeIds && (
              <p className="text-xs text-destructive">
                {form.formState.errors.employeeIds.message}
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Work Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("workDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("workDate") ? (
                    format(form.watch("workDate"), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("workDate")}
                  onSelect={(date) => date && form.setValue("workDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Work Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Work Description
          </label>
          <Textarea
            placeholder="What work is being done today? (e.g., Welding frame, Painting panels...)"
            className="resize-none h-20"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-xs text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2 justify-end">
          {success && (
            <span className="text-emerald-500 text-xs flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Assigned successfully
            </span>
          )}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Assign Task
          </Button>
        </div>
      </form>
    </div>
  );
}
