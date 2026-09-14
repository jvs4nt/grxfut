import {
  cancelAttendanceAction,
  confirmAttendanceAction,
} from "@/app/(app)/membros/actions";
import { PendingForm } from "@/components/busy-overlay";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";

export function RsvpForm({
  attending,
}: {
  attending: boolean;
}) {
  if (attending) {
    return (
      <PendingForm action={cancelAttendanceAction}>
        <button type="submit" className={secondaryButtonClass}>
          Desistir
        </button>
      </PendingForm>
    );
  }

  return (
    <PendingForm action={confirmAttendanceAction}>
      <button type="submit" className={buttonClass}>
        Confirmar presença
      </button>
    </PendingForm>
  );
}
