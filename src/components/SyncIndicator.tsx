"use client";

import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

export default function SyncIndicator() {
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [label, setLabel] = useState("Cargando...");

  useEffect(() => {
    setLastSync(new Date());
  }, []);

  useEffect(() => {
    if (!lastSync) return;

    function update() {
      if (!lastSync) return;
      const diffMs = Date.now() - lastSync.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) setLabel("Sincronizado ahora");
      else if (diffMin === 1) setLabel("Hace 1 min");
      else if (diffMin < 60) setLabel(`Hace ${diffMin} min`);
      else setLabel(`Hace ${Math.floor(diffMin / 60)}h`);
    }

    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [lastSync]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
      <FiRefreshCw size={11} />
      <span>{label}</span>
    </div>
  );
}
