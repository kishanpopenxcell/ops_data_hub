"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center rounded-2xl border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-good-soft text-good">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-semibold text-text">Check your inbox</h1>
        <p className="mt-2 text-sm text-text-muted">
          We sent a confirmation link to <span className="text-text">{email}</span>. Confirm your
          email to finish setting up your workspace.
        </p>
        <Link href="/login" className="mt-6 text-sm font-medium text-accent hover:text-accent-strong">
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent"
        >
          <TrendingUp className="h-5 w-5" />
        </motion.div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          Create your workspace
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Start seeing your operation clearly in minutes
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
      >
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jordan Rivera"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

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
          Create account
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-strong">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
