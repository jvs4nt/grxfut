import {
  cancelAttendanceAction,
  confirmAttendanceAction,
} from "@/app/(app)/membros/actions";
import { buttonClass, secondaryButtonClass } from "@/lib/ui";

export function RsvpForm({
  attending,
}: {
  attending: boolean;
}) {
  if (attending) {
    return (
      <form action={cancelAttendanceAction}>
        <button type="submit" className={secondaryButtonClass}>
          Desistir
        </button>
      </form>
    );
  }

  return (
    <form action={confirmAttendanceAction}>
      <button type="submit" className={buttonClass}>
        Confirmar presença
      </button>
    </form>
  );
}
