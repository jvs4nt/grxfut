import { runDrawAction } from "@/app/(app)/sorteio/actions";
import { buttonClass } from "@/lib/ui";

export function RunDrawForm({ hasResult }: { hasResult: boolean }) {
  return (
    <form action={runDrawAction}>
      <button type="submit" className={buttonClass}>
        {hasResult ? "Sortear de novo" : "Sortear times"}
      </button>
    </form>
  );
}
