# 6. Presença e membros

**Objetivo:** lista de quem vai jogar e quem está na reserva.

**Depende de:** [5. Jogos e home](../05-jogos-e-home/README.md).

**Status:** pendente

## Implementar

- Membro confirma presença no **próximo fut**
- Listas **Confirmados** e **Reservas** na tela de membros
- Tier visível em cada linha
- Presença ligada ao `match` vigente (`scheduled` mais próximo), não a um jogo antigo
- Um jogador só tem um status por jogo (`confirmed` \| `reserve`)

## Testar

- [ ] Membro confirma e aparece em Confirmados (ou Reservas, se a regra de vaga mandar)
- [ ] Tela de membros lista só o próximo jogo, não um `rest` ou jogo passado
- [ ] Tier de cada jogador aparece nas duas listas
- [ ] Confirmar de novo no mesmo jogo não duplica a linha
- [ ] Refresh mantém Confirmados e Reservas
- [ ] Sem próximo jogo `scheduled`, a tela não quebra (estado vazio)
- [ ] Admin também vê as listas (e não precisa “confirmar” para gerenciar o resto do painel)

## Pronto quando

O Membro aparece em Confirmados ou Reservas depois de confirmar; a tela de membros reflete o próximo jogo.
