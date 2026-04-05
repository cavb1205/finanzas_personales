import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiInfo } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  tooltip?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "emerald" | "blue" | "amber" | "rose" | "indigo" | "purple";
}

const colorMap: Record<string, string> = {
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
  indigo: "text-indigo-400",
  purple: "text-purple-400",
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  tooltip,
  icon,
  color = "emerald",
}: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-muted-foreground/50 hover:text-muted-foreground cursor-default">
                    <FiInfo size={12} />
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className={cn("opacity-70", colorMap[color])}>{icon}</span>
        </div>
        <p className={cn("mt-2 text-2xl font-bold font-mono tracking-tight", colorMap[color])}>
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
