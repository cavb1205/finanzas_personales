"use client";

import { FiPlus } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface Props {
  onClick: () => void;
  label?: string;
  className?: string;
}

export default function Fab({ onClick, label = "Nueva transacción", className }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 hover:brightness-110",
        className
      )}
    >
      <FiPlus size={24} />
    </button>
  );
}
