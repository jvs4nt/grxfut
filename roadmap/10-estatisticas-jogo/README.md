# 10. Estatísticas do jogo

**Objetivo:** registrar gols, assistências e defesas durante o fut ao vivo, com cronômetro, resumo da partida e totais acumulados por jogador.

**Depende de:** [5. Jogos e home](../05-jogos-e-home/README.md) (próximo `scheduled`) e [6. Presença](../06-presenca-e-membros/README.md) (lista de confirmados). Mesmo critério de “confirmado” do [8. Sorteio](../08-sorteio/README.md) — só quem está `confirmed` no próximo fut.

**Status:** pendente

## Implementar

### Navegação e acesso

- Rota autenticada `/jogo` (e sub-rota admin `/jogo/auditoria` ou bloco equivalente na mesma área).
- Botão na **home** (ex.: “Jogo”) para abrir `/jogo`, visível quando existir próximo jogo `scheduled` (`getNextScheduledMatch()`).
- **Guest** não acessa `/jogo` (mesma regra de `/sorteio` e `/membros` na navbar).
- **Admin** e **member** podem iniciar o jogo, registrar eventos e encerrar.

### Fluxo da tela `/jogo`

1. **Sem próximo jogo** ou **zero confirmados:** estado vazio com mensagem clara; sem botão de iniciar.
2. **Pronto para jogar:** exibe data/horário/local do fut (opcional, resumo) e botão **INICIAR JOGO**; a lista de jogadores **não** aparece ainda.
3. **Ao vivo** (após iniciar):
   - **Cronômetro** (ex.: `mm:ss`, `hh:mm:ss` se passar de 1h) com **pausar** e **zerar**.
   - Lista de todos os jogadores **confirmados** do próximo fut (nome + tier, como nas outras telas).
   - Por jogador, três ações (ícone + label acessível):
     - **Bola** → gol
     - **Chuteira** → assistência
     - **Defesa** → defesa
   - Cada toque incrementa o contador da sessão para aquele jogador e soma pontos na linha.
   - Ao lado do nome, seta de voltar abre `Deseja zerar as estatísticas de [nome]?` e apaga os eventos daquele jogador na sessão ao vivo.
4. **ENCERRAR JOGO** fica **acima** da lista de confirmados. Abre um modal de confirmação (`Encerrar o jogo?`). Ao confirmar, o cronômetro para e abre o modal de estatísticas:
   - Duração final do cronômetro
   - Só jogadores com algum evento (gol, assistência ou defesa); quem ficou zerado não aparece
   - Em cada linha, só os números maiores que zero, mais os pontos
   - Total de pontos da sessão
   - Botão confirmar grava no banco (overlay «Salvando» / `GaruxBusyOverlay`).
5. Após gravar, sessão fica `finished`; a tela volta ao estado inicial (ou mostra “partida encerrada” com link para ver resumo — detalhe de UX livre, mas deve persistir).

### Pontuação

| Evento      | Pontos |
| ----------- | ------ |
| Gol         | +2     |
| Assistência | +1     |
| Defesa      | +1     |

Pontos da partida = `2 × gols + 1 × assistências + 1 × defesas` por jogador.

### Sessão e concorrência

- No máximo **uma sessão `live`** por `matchId` (próximo fut).
- Se já existir sessão `live` para esse jogo, **qualquer membro** que abrir `/jogo` **retoma** a mesma sessão (cronômetro, contadores e eventos já registrados) — não criar segunda sessão em paralelo.
- Actions recebem `matchId` da página e recusam se não for mais o próximo jogo: *“O jogo mudou. Atualize a página.”* (mesmo padrão de presença).

### Persistência (schema sugerido)

Novas tabelas no Neon (Drizzle), alinhadas ao restante do app:

- **`match_stat_sessions`**
  - `matchId` → `matches.id`
  - `status`: `live` | `finished`
  - `startedAt`, `endedAt` (nullable até encerrar)
  - `durationSeconds` — valor **final** do cronômetro ao encerrar (não wall-clock obrigatório se o cronômetro foi pausado/zerado)
  - `elapsedSeconds`, `timerRunning`, `timerAnchorAt` — estado do cronômetro para pausar, zerar e retomar no refresh
  - `startedBy`, `endedBy` → `users.id`

- **`match_stat_events`** (fonte da verdade + auditoria)
  - `sessionId` → `match_stat_sessions.id`
  - `targetUserId` → jogador que recebeu o evento
  - `type`: `goal` | `assist` | `defense`
  - `points` (2, 1 ou 1) — redundante mas útil para relatórios
  - `recordedBy` → quem tocou o botão na UI (`recordedName` guarda o nome se a conta for excluída)
  - `createdAt`

  Cada toque em bola/chuteira/defesa **insere uma linha** imediatamente (sessão ao vivo), não só no encerrar.

- **`player_stat_totals`** (acumulado global por jogador)
  - `userId` (único)
  - `goals`, `assists`, `defenses`, `points`
  - Atualizar **no encerrar** da sessão: somar os totais da partida aos agregados (abordagem simples; não job assíncrono na fase 10).

Resumo da partida = agregar `match_stat_events` da sessão `finished` (ou campos derivados salvos na sessão, se preferir duplicar para leitura rápida).

### Auditoria (admin)

- Consulta **read-only** para Admin: listar eventos de `match_stat_events` com `recordedBy`, jogador alvo, tipo, horário e sessão/partida.
- Filtro mínimo: por `matchId` ou por sessão.
- Implementação sugerida: seção **Auditoria** em `/jogo` (só admin) ou `/jogo/auditoria`.

### Fora desta fase

- Ranking público elaborado, gráficos e comparativos entre temporadas
- Editar ou apagar eventos depois de encerrado
- Desfazer só o último toque (a seta zera o jogador inteiro na sessão ao vivo)
- Terceiro time ou regras de sorteio alteradas por estatísticas

## Testar

- [ ] Sem próximo `scheduled`, `/jogo` não quebra (vazio)
- [ ] Com jogo mas sem confirmados, não permite iniciar (mensagem clara)
- [ ] Home mostra botão para `/jogo` só quando há próximo jogo
- [ ] INICIAR JOGO cria sessão `live` e mostra cronômetro + lista de confirmados (reservas e aguardando pagamento não aparecem)
- [ ] Bola / chuteira / defesa incrementam contadores e pontos (+2 / +1 / +1) na UI
- [ ] Pausar e zerar o cronômetro funcionam durante a sessão
- [ ] ENCERRAR para o cronômetro e abre modal com resumo correto
- [ ] Confirmar no modal grava sessão `finished`, eventos e atualiza `player_stat_totals`
- [ ] Refresh durante sessão `live` retoma a mesma sessão (um `live` por `matchId`)
- [ ] Membro B vê e continua sessão iniciada por membro A
- [ ] Guest não acessa `/jogo` (redirect ou 403 consistente com o app)
- [ ] `matchId` desatualizado após mudança do próximo fut retorna erro e pede refresh
- [ ] Admin vê auditoria com `recordedBy` correto para cada evento
- [ ] Overlay «Salvando» ao confirmar encerramento

## Pronto quando

Qualquer membro (não guest) registra estatísticas ao vivo no próximo fut; ao encerrar, o resumo da partida fica salvo, os totais globais dos jogadores atualizam e o admin consegue consultar quem registrou cada evento.
