# 7. Pagamento e modal

**Objetivo:** estado de pagamento do próximo fut visível e cobrável.

**Depende de:** [6. Presença e membros](../06-presenca-e-membros/README.md).

**Status:** pronto

## Implementar

- Default de todo jogador no próximo fut: `CALOTE` (vermelho)
- Admin marca/remove `PAGO` (verde)
- Admin marca `AGENDADO` + data `dd/mm` (amarelo)
- Estados mutuamente exclusivos
- Tela de pagamento com progresso (%) = jogadores com flag `PAGO`
- Lista rápida de pagamento na home (PAGO / AGENDADO / CALOTE)
- Modal só para **Membro** ao entrar no sistema:
  - CALOTE → destaque vermelho, `PAGA O FUTEBOL ARROMBADO`
  - AGENDADO → destaque amarelo, `NÃO ESQUECE DE PAGAR ATÉ O DIA dd/mm`
  - PAGO → sem modal
- Admin **não** recebe o modal
- Membro não altera flags (só visualiza)

## Testar

- [x] Jogador novo no próximo fut começa vermelho (CALOTE)
- [x] Admin marca PAGO: linha verde; remove PAGO: volta a CALOTE (ou ao estado anterior definido)
- [x] Admin marca AGENDADO com data: linha amarela e `dd/mm` visível
- [x] Não dá para ter PAGO e AGENDADO ao mesmo tempo
- [x] Progresso % conta só `PAGO` e atualiza na hora
- [x] Home mostra a lista rápida com as mesmas cores
- [x] Membro em CALOTE vê o modal vermelho com o texto do spec
- [x] Membro em AGENDADO vê o modal amarelo com a data anotada
- [x] Membro em PAGO não vê modal
- [x] Admin logado nunca vê o modal, independente da própria flag
- [x] API de alterar flag com sessão de Membro retorna 403
- [x] Refresh mantém flags, data de agendamento e progresso

## Pronto quando

As flags mudam a cor e o progresso; o Membro em CALOTE ou AGENDADO vê o modal certo; PAGO e Admin não veem modal.
