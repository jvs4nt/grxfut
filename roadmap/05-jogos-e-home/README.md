# 5. Jogos e home

**Objetivo:** todo mundo sabe quando e onde é o próximo fut.

**Depende de:** [4. Usuários e tiers](../04-usuarios-e-tiers/README.md).

**Status:** pronto

## Implementar

- Admin define/edita data, horário e local do jogo
- Admin cancela a semana: `status = rest`; o calendário **não** apaga a linha
- Home: destaque da data do próximo `scheduled`
- Semana cancelada: destaque `Semana de descanso; Próximo fut: dd/mm`
- Calendário vertical com os próximos jogos (incluindo semanas `rest`)
- Membro só visualiza; não edita data/horário/local nem cancela

## Testar

- [x] Home sem jogo futuro trata o vazio (não quebra)
- [x] Admin cria/edita data, horário e local; home e calendário atualizam
- [x] Membro vê as mesmas informações e não tem controles de edição
- [x] API de editar/cancelar com sessão de Membro retorna 403
- [x] Cancelar a semana atual marca `rest` e o destaque vira `Semana de descanso; Próximo fut: dd/mm`
- [x] A semana cancelada continua no calendário
- [x] Depois de um `rest`, o destaque aponta para a próxima data `scheduled`
- [x] Calendário lista os próximos jogos em ordem vertical
- [x] Refresh mantém data, status e local (persistido no Neon)

## Pronto quando

A home mostra o próximo `scheduled`; cancelar a semana atualiza o destaque e mantém o histórico no calendário.
