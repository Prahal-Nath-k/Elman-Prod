import Link from "next/link";
import { Factory, Cpu, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/20">
              <Factory className="size-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Elman ERP
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Select a production division to access the pipeline and manage active jobs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <DivisionCard
            title="Mechanical Division"
            description="Fabrication, welding, machining, and heavy manufacturing workflows."
            href="/mechanical"
            icon={<Factory className="size-6" />}
            color="bg-blue-500/10 text-blue-500 border-blue-500/20"
            hoverColor="hover:border-blue-500/40 hover:bg-blue-500/5"
          />
          <DivisionCard
            title="Electrical Division"
            description="Assembly, circuit testing, and high-precision electronic manufacturing."
            href="/electronic"
            icon={<Cpu className="size-6" />}
            color="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            hoverColor="hover:border-emerald-500/40 hover:bg-emerald-500/5"
          />
        </div>
      </div>
    </div>
  );
}

function DivisionCard({
  title,
  description,
  href,
  icon,
  color,
  hoverColor,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative p-8 rounded-3xl border transition-all duration-300 ${color} ${hoverColor} active:scale-[0.98]`}
    >
      <div className="space-y-4">
        <div className={`size-12 rounded-xl flex items-center justify-center bg-background border shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Enter Division <ChevronRight className="ml-1 size-3" />
        </div>
      </div>
    </Link>
  );
}
