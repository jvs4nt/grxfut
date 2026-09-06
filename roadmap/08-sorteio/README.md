# 8. Sorteio

**Objetivo:** times do próximo fut sorteados, justos e persistidos.

**Depende de:** [6. Presença](../06-presenca-e-membros/README.md) (quem entra) e [4. Tiers](../04-usuarios-e-tiers/README.md) (balanceamento). Pagamento ([7](../07-pagamento-e-modal/README.md)) pode já existir, mas não entra na regra do sorteio.

## Implementar

- Admin dispara o sorteio do **próximo fut**
- Só jogadores **confirmados** participam (reservas da fila de espera não entram)
- Dois times (`team_a`, `team_b`)
- Quantidade ímpar: o restante vai para `draw_reserve` (não cria terceiro time)
- Balanceamento por tier; **no máximo um Capitão por time**
- Resultado salvo em `draws` + `draw_players`
- Novo sorteio do Admin **substitui** o anterior do mesmo jogo
- Resultado visível depois do reload
- Membro vê o resultado; só o Admin sorteia de novo

## Testar

- [ ] Sem confirmados, o sorteio não gera times (erro claro ou estado vazio)
- [ ] Só confirmados aparecem nos times; reservas da tela de membros ficam de fora
- [ ] Sempre no máximo dois times
- [ ] N confirmados ímpar: N−1 nos times, 1 em reserva do sorteio
- [ ] Nenhum time tem mais de um Capitão
- [ ] Tiers (Tenente/Soldado) ficam distribuídos, não todos num lado
- [ ] Refresh mostra o mesmo resultado
- [ ] Segundo sorteio apaga/substitui o primeiro (um vigente por jogo)
- [ ] API de sortear com sessão de Membro retorna 403
- [ ] Membro consegue só visualizar os times salvos

## Pronto quando

O resultado reaparece após refresh; um segundo sorteio apaga o primeiro; as regras de Capitão e ímpar se cumprem.
