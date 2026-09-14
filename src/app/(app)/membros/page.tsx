import {
  AttendanceMoveButton,
  AttendanceRemoveButton,
  AttendanceSelect,
} from "@/components/attendance-select";
import { CreateUserModal } from "@/components/create-user-modal";
import { CreateGuestModal } from "@/components/create-guest-modal";
import { DeleteMemberButton } from "@/components/delete-member-button";
import { EditMemberModal } from "@/components/edit-member-modal";
import { TierSelect } from "@/components/tier-select";
import { ToggleActiveButton } from "@/components/toggle-active-button";
import {
  listAttendances,
  splitAttendances,
  type AttendanceRow,
} from "@/lib/attendance";
import { requireSession, isAdmin } from "@/lib/auth";
import { formatDayMonthYear } from "@/lib/dates";
import { TIER_LABELS } from "@/lib/labels";
import { getNextScheduledMatch } from "@/lib/matches";
import { listUsers } from "@/lib/users";
import { cardClass } from "@/lib/ui";

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const user = await requireSession();
  if (user.role === "guest") redirect("/");
  const admin = isAdmin(user);
  const [match, roster] = await Promise.all([
    getNextScheduledMatch(),
    listUsers(),
  ]);
  const attendances = match ? await listAttendances(match.id) : [];
  const { confirmed, reserves } = splitAttendances(attendances);
  const attendanceByUser = new Map(
    attendances.map((row) => [row.userId, row.status]),
  );

  return (
    <main className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-emerald-400">
            Membros
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Quem vai</h1>
          <p className="text-sm text-zinc-400">
            {match
              ? `Presença do próximo fut em ${formatDayMonthYear(match.date)}.`
              : "Sem próximo jogo scheduled — as listas de presença ficam vazias."}
          </p>
        </div>
        {admin ? (
          <div className="flex gap-2">
            <CreateGuestModal />
            <CreateUserModal />
          </div>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <PlayerList
          title="Confirmados"
          empty="Ninguém confirmou ainda."
          rows={confirmed}
          canEditTier={admin}
          canManage={admin && Boolean(match)}
        />
        <PlayerList
          title="Reservas"
          empty="Fila de espera vazia."
          rows={reserves}
          canEditTier={admin}
          canManage={admin && Boolean(match)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Elenco{" "}
          <span className="font-normal">({roster.length})</span>
        </h2>
        <ul className="flex flex-col gap-2">
          {roster.map((member) => (
            <li
              key={member.id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {member.name}{" "}
                  {!member.active && (
                    <span className="ml-1 rounded-sm bg-red-500/20 px-1 py-0.5 text-[10px] uppercase text-red-400">
                      Inativo
                    </span>
                  )}
                </p>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {member.username} · {member.role}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {admin && match ? (
                  <AttendanceSelect
                    userId={member.id}
                    name={member.name}
                    status={attendanceByUser.get(member.id) ?? null}
                  />
                ) : null}
                <TierSelect
                  userId={member.id}
                  tier={member.tier}
                  canEdit={admin}
                />
                {admin &&
                (member.role === "member" || member.id === user.id) ? (
                  <EditMemberModal
                    userId={member.id}
                    username={member.username}
                    name={member.name}
                  />
                ) : null}
                {admin && member.role === "member" ? (
                  <DeleteMemberButton
                    userId={member.id}
                    name={member.name}
                  />
                ) : null}
                {admin && member.id !== user.id ? (
                  <ToggleActiveButton userId={member.id} active={member.active} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function PlayerList({
  title,
  empty,
  rows,
  canEditTier,
  canManage,
}: {
  title: string;
  empty: string;
  rows: AttendanceRow[];
  canEditTier: boolean;
  canManage: boolean;
}) {
  return (
    <div className={cardClass}>
      <h2 className="text-lg font-semibold">
        {title}{" "}
        <span className="text-sm font-normal text-zinc-500">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">{empty}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/80 px-3 py-2"
            >
              <span className="font-medium">{row.name}</span>
              <div className="flex flex-wrap items-center gap-2">
                {canEditTier ? (
                  <TierSelect userId={row.userId} tier={row.tier} canEdit />
                ) : (
                  <span className="text-sm text-zinc-400">
                    {TIER_LABELS[row.tier]}
                  </span>
                )}
                {canManage ? (
                  <>
                    <AttendanceMoveButton
                      userId={row.userId}
                      name={row.name}
                    />
                    <AttendanceRemoveButton
                      userId={row.userId}
                      name={row.name}
                    />
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
