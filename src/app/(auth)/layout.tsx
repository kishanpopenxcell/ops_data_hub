"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TypingCopy } from "@/components/auth/typing-copy";
import { BrandMark } from "@/components/dashboard/brand-mark";

const PANEL_CONTENT: Record<string, { src: string; heading: string; body: string }> = {
  "/login": {
    src: "/illustrations/login-illustration.svg",
    heading: "See your operation clearly.",
    body: "Pipeline, service, and productivity — one workspace, scoped to what each role should see.",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const panel = PANEL_CONTENT[pathname] ?? PANEL_CONTENT["/login"];

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-base">
      <AuthGradient />

      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <BrandMark className="absolute left-6 top-6 z-20 flex items-center gap-2.5 lg:left-10 lg:top-10" />

      {/* Illustration side — sits on the same gradient as the form, no separate panel background */}
      <div className="relative hidden w-1/2 shrink-0 lg:block">
        <div className="relative z-10 flex h-full items-center justify-center px-10 pb-24 pt-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={panel.src}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full max-w-md"
            >
              {/* frosted disc so the illustration's own light floor shape reads as
                  an intentional glass stage instead of a stray white blob */}
              <div className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface/40 backdrop-blur-2xl" />
              <Image
                src={panel.src}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 28rem, 0px"
                className="relative object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-16 left-10 right-10 z-10 max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={panel.heading}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <TypingCopy heading={panel.heading} body={panel.body} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-16">
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function AuthGradient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base diagonal wash, ties both halves into one continuous surface */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, var(--color-base) 0%, var(--color-surface) 45%, var(--color-base) 100%)",
        }}
      />
      <div className="absolute left-[-8%] top-[-15%] h-[34rem] w-[34rem] rounded-full bg-accent/[0.12] blur-[130px]" />
      <div className="absolute right-[-10%] top-[20%] h-[30rem] w-[30rem] rounded-full bg-chart-4/[0.09] blur-[130px]" />
      <div className="absolute bottom-[-20%] left-[30%] h-[32rem] w-[32rem] rounded-full bg-chart-3/[0.07] blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
