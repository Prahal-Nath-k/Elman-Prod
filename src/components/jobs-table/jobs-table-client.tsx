"use client";

import { ProductionJob, Employee } from "@prisma/client";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";

interface JobsTableClientProps {
  jobs: ProductionJob[];
  currentUser: Employee;
}

export function JobsTableClient({ jobs, currentUser }: JobsTableClientProps) {
  const columns = getColumns(currentUser);
  return <DataTable columns={columns} data={jobs} />;
}
