"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon } from "@/components/icons";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { Reveal } from "@/components/reveal";
import type { MensalState } from "@/lib/mensal";
import { revealDelay } from "@/lib/reveal";
import {
  buttonClass,
  cardClass,
  iconButtonClass,
  iconDangerButtonClass,
  inputClass,
  listRowClass,
  secondaryButtonClass,
} from "@/lib/ui";
import { updateMensalConfigAction, updateMensalistasAction } from "./actions";

export function MensalClient({
  initialState,
  isAdmin,
}: {
  initialState: MensalState;
  isAdmin: boolean;
}) {
  const [monthName, setMonthName] = useState(initialState.monthName);
  const [amount, setAmount] = useState(initialState.amount);
  const [members, setMembers] = useState<string[]>(initialState.members);

  const [modal, setModal] = useState<"config" | "members" | null>(null);

  // Inputs do modal de mês/valor
  const [monthInput, setMonthInput] = useState(initialState.monthName);
  const [amountInput, setAmountInput] = useState(
    (initialState.amount / 100).toFixed(2),
  );

  // Inputs do modal de mensalistas
  const [draftMembers, setDraftMembers] = useState<string[]>(
    initialState.members,
  );
  const [newMemberName, setNewMemberName] = useState("");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedAmount = (amount / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const openConfigModal = () => {
    setMonthInput(monthName);
    setAmountInput((amount / 100).toFixed(2));
    setError(null);
    setModal("config");
  };

  const openMembersModal = () => {
    setDraftMembers([...members]);
    setNewMemberName("");
    setMonthInput(monthName);
    setAmountInput((amount / 100).toFixed(2));
    setError(null);
    setModal("members");
  };

  const handleAddDraftMember = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    setDraftMembers((prev) => [...prev, trimmed]);
    setNewMemberName("");
  };

  const handleRemoveDraftMember = (index: number) => {
    setDraftMembers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleChangeDraftMember = (index: number, value: string) => {
    setDraftMembers((prev) =>
      prev.map((item, idx) => (idx === index ? value : item)),
    );
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsPending(true);
    setError(null);
    try {
      const updated = await updateMensalConfigAction({
        monthName: monthInput,
        amountStr: amountInput,
      });
      setMonthName(updated.monthName);
      setAmount(updated.amount);
      setModal(null);
    } catch (err) {
      console.error(err);
      setError("Verifique o nome do mês e o valor informado.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSaveMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const finalMembers = [...draftMembers];
    if (newMemberName.trim()) {
      finalMembers.push(newMemberName.trim());
    }

    setIsPending(true);
    setError(null);
    try {
      const configUpdated = await updateMensalConfigAction({
        monthName: monthInput,
        amountStr: amountInput,
      });
      const membersUpdated = await updateMensalistasAction(finalMembers);
      setMonthName(configUpdated.monthName);
      setAmount(configUpdated.amount);
      setMembers(membersUpdated.members);
      setNewMemberName("");
      setModal(null);
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar as alterações.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex flex-col gap-8">
      {/* Card de destaque do Mês e Valor do Mensal */}
      <Reveal
        className={`${cardClass} flex flex-col items-center justify-center p-8`}
        delayMs={revealDelay(0)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
            Mensal · {monthName}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formattedAmount}
          </span>
          {isAdmin && (
            <button
              type="button"
              onClick={openConfigModal}
              className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Editar mês e valor do mensal"
              aria-label="Editar mês e valor do mensal"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Valor por mensalista referente ao mês de {monthName}
        </p>
      </Reveal>

      {/* Lista de Mensalistas */}
      <Reveal as="section" className={cardClass} delayMs={revealDelay(1)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Mensalistas{" "}
              <span className="text-sm font-normal text-zinc-600 dark:text-zinc-500">
                ({members.length})
              </span>
            </h2>
            {isAdmin && (
              <button
                type="button"
                onClick={openMembersModal}
                className={iconButtonClass}
                title="Editar mensalistas, mês e valor"
                aria-label="Editar mensalistas, mês e valor"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {members.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-500">
            Nenhum mensalista cadastrado.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {members.map((name, index) => (
              <li key={`${index}-${name}`} className={listRowClass}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {index + 1}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {name}
                  </span>
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {formattedAmount}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Reveal>

      {/* Modal: Editar apenas Mês e Valor */}
      <ModalBackdrop open={modal === "config"}>
        <ModalPanel>
          <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Editar Mês e Valor do Mensal
          </h3>
          <form onSubmit={handleSaveConfig} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mês em questão
              </label>
              <input
                type="text"
                required
                value={monthInput}
                onChange={(e) => setMonthInput(e.target.value)}
                className={`${inputClass} w-full`}
                placeholder="Ex: Dezembro"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Valor do Mensal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className={`${inputClass} w-full`}
                placeholder="37.17"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={isPending}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={buttonClass}
              >
                {isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </ModalPanel>
      </ModalBackdrop>

      {/* Modal: Editar Mensalistas (e também Mês/Valor) */}
      <ModalBackdrop open={modal === "members"}>
        <ModalPanel className="max-w-lg">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Editar Mensal e Mensalistas ({draftMembers.length})
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Altere o mês/valor ou adicione e remova mensalistas da lista.
          </p>

          <form
            onSubmit={handleSaveMembers}
            className="mt-4 flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Mês em questão
                </label>
                <input
                  type="text"
                  required
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  className={`${inputClass} w-full py-2 text-sm`}
                  placeholder="Ex: Dezembro"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Valor do Mensal (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className={`${inputClass} w-full py-2 text-sm`}
                  placeholder="37.17"
                />
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Adicionar mensalista
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDraftMember();
                    }
                  }}
                  placeholder="Nome do novo mensalista..."
                  className={`${inputClass} flex-1 py-2 text-sm`}
                />
                <button
                  type="button"
                  onClick={handleAddDraftMember}
                  className={secondaryButtonClass}
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto pr-1">
              {draftMembers.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-500">
                  Lista vazia. Adicione um mensalista acima.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {draftMembers.map((name, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 text-right text-xs font-semibold text-zinc-500">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                          handleChangeDraftMember(index, e.target.value)
                        }
                        className={`${inputClass} flex-1 py-1.5 text-sm`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftMember(index)}
                        className={iconDangerButtonClass}
                        title={`Retirar ${name}`}
                        aria-label={`Retirar ${name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                disabled={isPending}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={buttonClass}
              >
                {isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </ModalPanel>
      </ModalBackdrop>
    </main>
  );
}

