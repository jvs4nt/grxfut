# 6. Presença e membros

**Objetivo:** lista de quem vai jogar e quem está na reserva.

**Depende de:** [5. Jogos e home](../05-jogos-e-home/README.md).

**Status:** pronto

## Implementar

- Membro confirma presença no **próximo fut**
- Listas **Confirmados** e **Reservas** na tela de membros
- Tier visível em cada linha
- Presença ligada ao `match` vigente (`scheduled` mais próximo), não a um jogo antigo
- Um jogador só tem um status por jogo (`confirmed` \| `reserve`)
- Cap de 18 confirmados; o restante entra na fila (FIFO). Desistir promove a reserva mais antiga

## Testar

- [x] Membro confirma e aparece em Confirmados (ou Reservas, se a regra de vaga mandar)
- [x] Tela de membros lista só o próximo jogo, não um `rest` ou jogo passado
- [x] Tier de cada jogador aparece nas duas listas
- [x] Confirmar de novo no mesmo jogo não duplica a linha
- [x] Refresh mantém Confirmados e Reservas
- [x] Sem próximo jogo `scheduled`, a tela não quebra (estado vazio)
- [x] Admin também vê as listas (e não precisa “confirmar” para gerenciar o resto do painel)

## Pronto quando

O Membro aparece em Confirmados ou Reservas depois de confirmar; a tela de membros reflete o próximo jogo.
