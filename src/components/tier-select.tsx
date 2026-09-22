"use client";

import { updateTierAction } from "@/app/(app)/membros/actions";
import { PendingForm } from "@/components/busy-overlay";
import { TIER_LABELS, type UserTier } from "@/lib/labels";
import { inputClass } from "@/lib/ui";

export function TierSelect({
  userId,
  tier,
  canEdit,
}: {
  userId: string;
  tier: UserTier;
  canEdit: boolean;
}) {
  if (!canEdit) {
    return <span className="text-sm text-zinc-700 dark:text-zinc-300">{TIER_LABELS[tier]}</span>;
  }

  return (
    <PendingForm action={updateTierAction}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="tier"
        defaultValue={tier}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={`${inputClass} py-1.5 text-sm`}
        aria-label="Alterar nível"
      >
        <option value="capitao">Capitão</option>
        <option value="tenente">Tenente</option>
        <option value="soldado">Soldado</option>
      </select>
    </PendingForm>
  );
}
