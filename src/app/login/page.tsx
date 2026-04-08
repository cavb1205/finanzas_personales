"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiLock } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Token incorrecto");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FiLock size={20} className="text-primary" />
          </div>
          <CardTitle className="text-lg">Acceso MiCaja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Token de acceso"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoFocus
              required
            />
            {error && (
              <p className="text-sm text-rose-400">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
