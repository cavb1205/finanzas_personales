"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import QuickAddDrawer from "@/components/QuickAddDrawer";

export default function GlobalFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Registrar nuevo movimiento"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 hover:brightness-110"
      >
        <FiPlus size={24} />
      </button>
      <QuickAddDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
