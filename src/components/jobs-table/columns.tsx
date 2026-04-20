"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ProductionJob, Employee } from "@/generated/prisma";
import { StatusBadge } from "@/components/status-badge";
import { AdvanceStatusButton } from "@/components/advance-status-button";
import { formatDistanceToNow } from "@/lib/format-date";

export const getColumns = (currentUser: Employee): ColumnDef<ProductionJob>[] => [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <Link href={`/jobs/${row.original.id}`} className="hover:underline text-primary">
        <span className="font-mono font-semibold text-sm">
          {row.getValue("reference")}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "title",
    header: "Project Name",
    cell: ({ row }) => (
      <span className="font-medium max-w-[280px] truncate block">
        {row.getValue("title")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => {
      const assignedTo = row.getValue("assignedTo") as string | null;
      return (
        <span className={assignedTo ? "text-foreground" : "text-muted-foreground text-sm italic"}>
          {assignedTo || "Unassigned"}
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatDistanceToNow(row.getValue("updatedAt"))}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <AdvanceStatusButton job={row.original} currentUser={currentUser} />,
  },
];
