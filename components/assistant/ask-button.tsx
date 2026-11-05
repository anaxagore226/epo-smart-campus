"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCampus } from "@/components/providers/campus-provider";

/** Pose une question à l'assistant IA puis ouvre sa page pour suivre la réponse. */
export function AskButton({ question, className, children }: { question: string; className?: string; children: ReactNode }) {
  const { ask } = useCampus();
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        ask(question);
        router.push("/dashboard/assistant");
      }}
    >
      {children}
    </button>
  );
}
