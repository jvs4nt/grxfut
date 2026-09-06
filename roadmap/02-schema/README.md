# 2. Schema e migrations

**Objetivo:** persistir o modelo de [stack.md](../../stack.md).

**Depende de:** [1. Bootstrap](../01-bootstrap/README.md).

**Status:** pendente

## Implementar

Tabelas e regras:

- `users` — `username` único, `password_hash`, `role` (`admin` \| `member`), `tier` (`capitao` \| `tenente` \| `soldado`)
- `matches` — `date`, `time`, `location`, `status` (`scheduled` \| `rest`)
- `attendances` — único por `(match_id, user_id)`; `confirmed` \| `reserve`
- `payments` — único por `(match_id, user_id)`; default `calote`; `scheduled_on` quando `agendado`
- `draws` — um sorteio vigente por `match_id`
- `draw_players` — `team_a` \| `team_b` \| `draw_reserve`

Migration inicial via `drizzle-kit`. Schema no código alinhado ao que roda no Neon.

## Testar

- [ ] `drizzle-kit generate` / `migrate` cria as 6 tabelas no Neon
- [ ] `username` duplicado é rejeitado
- [ ] Duas presenças iguais `(match_id, user_id)` são rejeitadas
- [ ] Dois pagamentos iguais `(match_id, user_id)` são rejeitados
- [ ] Não dá para ter dois sorteios vigentes no mesmo jogo
- [ ] `payments.status` default é `calote`
- [ ] FKs: apagar/referenciar `match` e `user` de forma consistente (sem órfãos acidentais)
- [ ] Schema no código bate com o banco (introspect ou migration reaplicada)

## Pronto quando

As tabelas existem no Neon e batem com o modelo documentado.
