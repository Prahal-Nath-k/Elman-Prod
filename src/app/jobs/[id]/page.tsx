import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobById, getEmployees } from "@/lib/actions";
import { ProgressStepper } from "@/components/progress-stepper";
import { AssignEmployeeForm } from "@/components/assign-employee-form";
import { AuditTimeline } from "@/components/audit-timeline";
import { AddMaterialForm } from "@/components/add-material-form";
import { ArrowLeft, HardHat } from "lucide-react";
import { MAN_STAGE_LABELS, getSafeManStageLabel } from "@/lib/production-status";

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;

  const job = await getJobById(id);
  if (!job) return notFound();

  const employees = await getEmployees();
  // Simulated authentication: pick the highest-privilege user so all actions (including Manager Approval) are available
  const currentUser =
    employees.find(e => e.role === 'OWNER') ??
    employees.find(e => e.role === 'ADMIN') ??
    employees.find(e => e.role === 'PURCHASE_HEAD') ??
    employees.find(e => e.role !== 'STAFF') ??
    employees[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-1 size-3" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HardHat className="size-5 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">
                  {job.reference}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">{job.title}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Manufacturing Stage
              </p>
              <p className="text-sm font-medium mt-1">{getSafeManStageLabel(job.currentStage, job.division as "MECHANICAL" | "ELECTRONIC")}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Material Setup */}
        <section>
          <AddMaterialForm job={job} currentUser={currentUser} />
        </section>

        {/* Progress Pipeline */}
        <section>
          <ProgressStepper job={job} currentUser={currentUser} />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Daily Assignments */}
          <section className="md:col-span-5 md:sticky md:top-6">
            <AssignEmployeeForm job={job} employees={employees} currentUser={currentUser} />
          </section>

          <section className="md:col-span-7">
            {currentUser.role === "OWNER" && (
              <AuditTimeline logs={job.activityLogs} division={job.division as "MECHANICAL" | "ELECTRONIC"} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
