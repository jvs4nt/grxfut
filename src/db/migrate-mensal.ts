import { ensureMensalSettingsTable, getMensalState } from "@/lib/mensal";

async function main() {
  await ensureMensalSettingsTable();
  const state = await getMensalState();
  console.log(
    `Tabela mensal_settings pronta (${state.monthName} - R$ ${(state.amount / 100).toFixed(2)} - ${state.members.length} mensalistas).`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

