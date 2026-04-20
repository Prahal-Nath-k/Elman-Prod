import { getJobs, getEmployees } from "@/lib/actions";
import { JobsTableClient } from "@/components/jobs-table/jobs-table-client";
import { CreateJobSheet } from "@/components/create-job-sheet";
import { PipelineStats } from "@/components/pipeline-stats";
import { Factory, Activity, Cpu, ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Division } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ division: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { division } = await params;
  const divisionUpper = division.toUpperCase();

  if (divisionUpper !== "MECHANICAL" && divisionUpper !== "ELECTRONIC") {
    return notFound();
  }

  const jobs = await getJobs(divisionUpper as Division);
  const employees = await getEmployees();
  // Simulated authentication: pick the highest-privilege user so all actions (including Manager Approval) are available
  const currentUser =
    employees.find(e => e.role === 'OWNER') ??
    employees.find(e => e.role === 'ADMIN') ??
    employees.find(e => e.role === 'PURCHASE_HEAD') ??
    employees.find(e => e.role !== 'STAFF') ??
    employees[0];

  const isMechanical = divisionUpper === "MECHANICAL";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="size-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ChevronLeft className="size-5" />
              </Link>
              <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                {isMechanical ? <Factory className="size-5" /> : <Cpu className="size-5" />}
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  {isMechanical ? "Mechanical Division" : "Electrical Division"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Production Pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className={`size-3.5 ${jobs.length > 0 ? "text-emerald-500" : "text-slate-400"}`} />
                <span>{jobs.length} active jobs</span>
              </div>
              <CreateJobSheet defaultDivision={divisionUpper as Division} />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Pipeline Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Pipeline Overview
            </h2>
            <div className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-tighter">
              Live
            </div>
          </div>
          <PipelineStats jobs={jobs} />
        </section>

        <Separator className="opacity-50" />

        {/* Jobs Table */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            All {isMechanical ? "Mechanical" : "Electronic"} Jobs
          </h2>
          <JobsTableClient jobs={jobs} currentUser={currentUser} />
        </section>
      </main>
    </div>
  );
}
