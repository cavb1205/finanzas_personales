import Link from "next/link";
import { FiHome, FiAlertCircle } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="text-muted-foreground/30">
        <FiAlertCircle size={56} />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-mono text-muted-foreground">404</h1>
        <p className="text-lg font-medium">Página no encontrada</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          La sección que buscas no existe o fue movida.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <FiHome size={15} />
        Volver al Dashboard
      </Link>
    </div>
  );
}
