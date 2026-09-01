"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RoleSelect, type DemoRole } from "@/components/auth/role-select";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<DemoRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleRoleChange(next: DemoRole) {
    setRole(next);
    setEmail(next.email);
    setPassword(next.password);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Unable to sign in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 flex h-11 w-11 items-center justify-center lg:hidden"
        >
          <Image src="/logo-square.png" alt="OpsData Hub" width={44} height={44} className="h-full w-full object-contain" />
        </motion.div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Sign in to your OpsData Hub workspace
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface/50 p-6 backdrop-blur-xl",
          "shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,var(--shadow-card)]",
        )}
      >
        <RoleSelect value={role} onChange={handleRoleChange} />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={role !== null}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={role !== null}
          required
        />

        {role !== null && (
          <button
            type="button"
            onClick={() => {
              setRole(null);
              setEmail("");
              setPassword("");
            }}
            className="-mt-1 self-start text-xs font-medium text-text-muted hover:text-text"
          >
            Use a different account
          </button>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg bg-crit-soft px-3 py-2 text-sm text-crit"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" loading={loading} className="mt-1 w-full">
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  );
}
