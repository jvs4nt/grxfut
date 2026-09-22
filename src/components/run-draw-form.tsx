import { runDrawAction } from "@/app/(app)/sorteio/actions";
import { PendingForm } from "@/components/busy-overlay";
import { buttonClass } from "@/lib/ui";

export function RunDrawForm({ hasResult }: { hasResult: boolean }) {
  return (
    <PendingForm action={runDrawAction}>
      <button type="submit" className={buttonClass}>
        {hasResult ? "Sortear de novo" : "Sortear times"}
      </button>
    </PendingForm>
  );
}
