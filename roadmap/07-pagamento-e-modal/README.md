# 7. Pagamento e modal

**Objetivo:** estado de pagamento do próximo fut visível e cobrável.

**Depende de:** [6. Presença e membros](../06-presenca-e-membros/README.md).

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

- [ ] Jogador novo no próximo fut começa vermelho (CALOTE)
- [ ] Admin marca PAGO: linha verde; remove PAGO: volta a CALOTE (ou ao estado anterior definido)
- [ ] Admin marca AGENDADO com data: linha amarela e `dd/mm` visível
- [ ] Não dá para ter PAGO e AGENDADO ao mesmo tempo
- [ ] Progresso % conta só `PAGO` e atualiza na hora
- [ ] Home mostra a lista rápida com as mesmas cores
- [ ] Membro em CALOTE vê o modal vermelho com o texto do spec
- [ ] Membro em AGENDADO vê o modal amarelo com a data anotada
- [ ] Membro em PAGO não vê modal
- [ ] Admin logado nunca vê o modal, independente da própria flag
- [ ] API de alterar flag com sessão de Membro retorna 403
- [ ] Refresh mantém flags, data de agendamento e progresso

## Pronto quando

As flags mudam a cor e o progresso; o Membro em CALOTE ou AGENDADO vê o modal certo; PAGO e Admin não veem modal.
