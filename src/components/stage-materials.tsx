"use client";

import { useState, useTransition } from "react";
import { JobMaterial, ManufacturingStage, Employee } from "@/generated/prisma";
import { updateMaterialStatus } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PackageOpen, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface StageMaterialsProps {
  jobId: string;
  stage: ManufacturingStage;
  materials: JobMaterial[];
  currentUser: Employee;
}

export function StageMaterials({
  jobId,
  stage,
  materials,
  currentUser,
}: StageMaterialsProps) {
  const [isPending, startTransition] = useTransition();

  const handleRequest = (material: JobMaterial) => {
    startTransition(async () => {
      await updateMaterialStatus(
        { materialId: material.id, status: "REQUESTED" },
        currentUser.id
      );
    });
  };

  const handleAvailable = (material: JobMaterial) => {
    startTransition(async () => {
      await updateMaterialStatus(
        { materialId: material.id, status: "AVAILABLE" },
        currentUser.id
      );
    });
  };

  const canRequest = currentUser.role !== "STAFF";
  const canMakeAvailable = ["ADMIN", "OWNER", "PURCHASE_HEAD", "STORE"].includes(
    currentUser.role
  );
  
  // if no materials, we can still show a blank state
  if (materials.length === 0) {
    return (
      <Card className="border-border/50 h-full flex flex-col shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <PackageOpen className="size-4 text-muted-foreground" />
             Required Materials
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <PackageOpen className="size-8 opacity-20 mb-2" />
          <span className="text-sm">No specific materials required for this stage.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 h-full shadow-sm flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <PackageOpen className="size-4" />
          Required Materials
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <div className="divide-y max-h-[300px] overflow-auto">
          {materials.map((mat) => (
            <div key={mat.id} className="p-4 flex flex-col sm:flex-row gap-3 justify-between sm:items-center hover:bg-muted/30 transition-colors">
              <div>
                <p className="text-sm font-medium">{mat.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Qty: {mat.quantity}</p>
              </div>
              <div className="flex items-center gap-3">
                {mat.status === "AVAILABLE" && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1 hidden sm:flex">
                    <CheckCircle2 className="size-3" /> Ready
                  </Badge>
                )}
                {mat.status === "REQUESTED" && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1 hidden sm:flex">
                    <Loader2 className="size-3 animate-spin" /> Pending
                  </Badge>
                )}
                {mat.status === "PENDING" && (
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 gap-1 hidden sm:flex">
                    <AlertCircle className="size-3" /> Needed
                  </Badge>
                )}

                {/* Actions */}
                {mat.status === "PENDING" && canRequest && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleRequest(mat)}
                    disabled={isPending}
                  >
                    Raise Request
                  </Button>
                )}
                
                {mat.status === "REQUESTED" && canMakeAvailable && (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleAvailable(mat)}
                    disabled={isPending}
                  >
                    Mark Available
                  </Button>
                )}
                
                <Badge variant="outline" className={`sm:hidden ${mat.status === "AVAILABLE" ? "text-emerald-600 border-emerald-200" : (mat.status==="REQUESTED" ? "text-amber-600 border-amber-200" : "text-slate-600 border-slate-200")}`}>
                  {mat.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
