import { RunDrawTrigger } from "@/components/run-draw-trigger";

export function RunDrawForm({ hasResult }: { hasResult: boolean }) {
  return (
    <RunDrawTrigger
      label={hasResult ? "Sortear de novo" : "Sortear times"}
    />
  );
}
