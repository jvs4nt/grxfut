"use client";

import { useState } from "react";
import { PencilIcon } from "@/components/icons";
import { addFundsAction, removeFundsAction, updateBalanceAction } from "./actions";
import { cardClass } from "@/lib/ui";
import { ModalBackdrop, ModalPanel } from "@/components/modal-backdrop";
import { Reveal } from "@/components/reveal";
import { revealDelay } from "@/lib/reveal";

type Transaction = {
  id: string;
  amount: number;
  type: "add" | "remove" | "edit";
  description: string;
  createdAt: Date;
  creatorName: string | null;
};

export function CaixaClient({
  balance,
  transactions,
  isAdmin,
}: {
  balance: number;
  transactions: Transaction[];
  isAdmin: boolean;
}) {
  const [modal, setModal] = useState<"add" | "remove" | "edit" | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [isPending, setIsPending] = useState(false);

  const formattedBalance = (balance / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const openModal = (type: "add" | "remove" | "edit") => {
    setModal(type);
    if (type === "edit") {
      setAmountInput((balance / 100).toFixed(2));
    } else {
      setAmountInput("");
    }
    setDescInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("amount", amountInput);
      formData.append("description", descInput);

      if (modal === "add") {
        await addFundsAction(formData);
      } else if (modal === "remove") {
        await removeFundsAction(formData);
      } else if (modal === "edit") {
        await updateBalanceAction(formData);
      }
      setModal(null);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro. Verifique o valor inserido.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Reveal className={`${cardClass} flex flex-col items-center justify-center p-8`} delayMs={revealDelay(0)}>
        <h1 className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Saldo em Caixa
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formattedBalance}
          </span>
          {isAdmin && (
            <button
              onClick={() => openModal("edit")}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Editar Saldo"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => openModal("add")}
              className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Adicionar
            </button>
            <button
              onClick={() => openModal("remove")}
              className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Retirar
            </button>
          </div>
        )}
      </Reveal>

      <Reveal delayMs={revealDelay(1)}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Últimas Movimentações
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma movimentação registrada.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Autor</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {transactions.map((t) => {
                  const val = Math.abs(t.amount / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });
                  const isNegative = t.type === "remove" || (t.type === "edit" && t.amount < 0);
                  return (
                    <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        {t.type === "add" && <span className="text-emerald-600 dark:text-emerald-400 font-medium">Entrada</span>}
                        {t.type === "remove" && <span className="text-red-600 dark:text-red-400 font-medium">Saída</span>}
                        {t.type === "edit" && <span className="text-amber-600 dark:text-amber-400 font-medium">Manual</span>}
                      </td>
                      <td className="px-4 py-3">{t.description}</td>
                      <td className="px-4 py-3">{t.creatorName || "Sistema"}</td>
                      <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                        isNegative ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {isNegative ? "-" : "+"} {val}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </Reveal>

      <ModalBackdrop open={modal !== null}>
        <ModalPanel>
            <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {modal === "add" && "Adicionar ao Caixa"}
              {modal === "remove" && "Retirar do Caixa"}
              {modal === "edit" && "Editar Saldo Total"}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {modal === "edit" ? "Novo Saldo Total (R$)" : "Valor (R$)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
                  placeholder="0,00"
                />
              </div>
              {modal !== "edit" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Descrição
                  </label>
                  <input
                    type="text"
                    required
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
                    placeholder="Ex: Compra de bola"
                  />
                </div>
              )}
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  disabled={isPending}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
                >
                  {isPending ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
        </ModalPanel>
      </ModalBackdrop>
    </div>
  );
}
