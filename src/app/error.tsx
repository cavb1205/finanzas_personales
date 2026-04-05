"use client";

import { useEffect } from "react";
import { FiRefreshCw, FiAlertTriangle } from "react-icons/fi";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="text-rose-400/40">
        <FiAlertTriangle size={56} />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium">Algo salió mal</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          No se pudieron cargar los datos. Puede ser un problema temporal con
          Google Sheets o la conexión.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground/50">
            ref: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
      >
        <FiRefreshCw size={14} />
        Reintentar
      </button>
    </div>
  );
}
