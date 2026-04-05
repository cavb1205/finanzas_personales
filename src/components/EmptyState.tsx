import { type ReactNode } from "react";
import { FiInbox } from "react-icons/fi";

interface Props {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export default function EmptyState({
  title = "Sin datos",
  description = "No hay información disponible en este momento.",
  icon,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-muted-foreground/40">
        {icon ?? <FiInbox size={40} />}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/60 max-w-xs">{description}</p>
    </div>
  );
}
