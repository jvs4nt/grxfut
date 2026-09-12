# 8. Sorteio

**Objetivo:** times do próximo fut sorteados, justos e persistidos.

**Depende de:** [6. Presença](../06-presenca-e-membros/README.md) (quem entra) e [4. Tiers](../04-usuarios-e-tiers/README.md) (balanceamento). Pagamento ([7](../07-pagamento-e-modal/README.md)) pode já existir, mas não entra na regra do sorteio.

**Status:** pronto

## Implementar

- Admin dispara o sorteio do **próximo fut**
- Só jogadores **confirmados** participam (reservas da fila de espera não entram)
- Dois times (`team_a`, `team_b`) de até 6 jogadores
- Excedente (mais de 12, ou Capitães extras) vai para `draw_reserve` (**Próximo**)
- Balanceamento por tier; **no máximo um Capitão por time**
- Resultado salvo em `draws` + `draw_players`
- Novo sorteio do Admin **substitui** o anterior do mesmo jogo
- Resultado visível depois do reload
- Membro vê o resultado; só o Admin sorteia de novo

## Testar

- [x] Sem confirmados, o sorteio não gera times (erro claro ou estado vazio)
- [x] Só confirmados aparecem nos times; reservas da tela de membros ficam de fora
- [x] Sempre no máximo dois times
- [x] Mais de 12 confirmados: 6+6 no campo, o resto em Próximo
- [x] Nenhum time tem mais de um Capitão
- [x] Tiers (Tenente/Soldado) ficam distribuídos, não todos num lado
- [x] Refresh mostra o mesmo resultado
- [x] Segundo sorteio apaga/substitui o primeiro (um vigente por jogo)
- [x] API de sortear com sessão de Membro retorna 403
- [x] Membro consegue só visualizar os times salvos

## Pronto quando

O resultado reaparece após refresh; um segundo sorteio apaga o primeiro; as regras de Capitão e 6 por time se cumprem.
