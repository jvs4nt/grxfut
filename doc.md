-teste felps
# GARUX

Webapp para organizar a gestão do futebol do grupo GARUX.

## Visão geral

O GARUX é um aplicativo web voltado para grupos de futebol amador, com o objetivo de centralizar a organização das partidas: data do próximo jogo, confirmação de presença, controle de pagamentos e sorteio de times.

## Perfis e autenticação

O acesso ao sistema exige login com **usuário e senha**. Não há cadastro público, recuperação por e-mail nem autenticação por redes sociais.

Novos usuários são criados apenas por um perfil **Admin**.

Dois perfis de acesso:

- **Admin**: cria usuários, gerencia jogos, altera data do fut, cancela a semana, controla tiers, realiza sorteios e marca flags de pagamento.
- **Membro**: acessa informações do fut, confirma presença e visualiza pagamentos.

## Painel admin

Área exclusiva do perfil Admin. A partir dela é possível:

- **Alterar a data do futebol**: define a data do próximo fut.
- **Cancelar o futebol da semana**: marca a semana atual como descanso. Na data do próximo fut aparece `Semana de descanso; Próximo fut: dd/mm`. O calendário não é apagado: a semana cancelada fica como descanso e a próxima data válida é exibida.
- **Controlar o tier de cada jogador**: atribui ou altera o tier (`Capitão`, `Tenente` ou `Soldado`).
- **Realizar o sorteio**: sorteia e salva os times do próximo futebol.

Horário e local da partida também podem ser definidos/editados pelo Admin.

## Funcionalidades

### Página inicial

- **Data do próximo fut**: exibida em destaque, com um calendário vertical mostrando os próximos jogos.
- Quando a semana estiver cancelada, o destaque da data mostra `Semana de descanso; Próximo fut: dd/mm`.
- **Personalização do jogo**: permite definir/editar horário e local da partida (Admin).
- **Lista de pagamento**: visão rápida do estado de cada jogador (PAGO, AGENDADO ou CALOTE).

### Tela de membros

- **Confirmados**: lista de jogadores que confirmaram presença no próximo fut.
- **Reservas**: lista de jogadores na fila de espera, caso haja vagas limitadas.
- **Tier**: classificação do jogador, visível na lista. Os tiers disponíveis são:
  - **Capitão**
  - **Tenente**
  - **Soldado**

Somente o Admin altera o tier. O membro visualiza o próprio tier e o dos demais.

### Pagamento

A tela de pagamento mostra o estado de cada jogador no próximo fut e um **progresso (%)** com o percentual de jogadores que já efetuaram o pagamento (flag PAGO).

Somente o Admin altera as flags. Para cada jogador, o Admin pode:

- Colocar ou remover a flag **PAGO**.
- Colocar a flag de **pagamento agendado**, anotando o dia em que será pago.

Estados visuais (mutuamente exclusivos):

| Estado    | Cor      | Significado                                      |
| --------- | -------- | ------------------------------------------------ |
| PAGO      | Verde    | Pagamento confirmado                             |
| AGENDADO  | Amarelo  | Pagamento marcado para uma data (`dd/mm`)        |
| CALOTE    | Vermelho | Não pagou e não agendou (estado padrão)          |

**CALOTE** é o estado inicial: o jogador permanece vermelho até o Admin marcar PAGO ou AGENDADO.

O dia anotado no agendamento é o prazo exibido na lista e no modal de cobrança. Jogadores em CALOTE aparecem em destaque como atrasados/pendentes.

### Sorteio

O Admin dispara o sorteio dos times do **próximo fut**.

Regras:

- Participam apenas os jogadores **confirmados**.
- O resultado é **aleatório** e **balanceado por tier**: os tiers são distribuídos entre os times.
- **Não pode haver mais de um Capitão por time**.
- O resultado fica **salvo no app** e permanece visível depois do sorteio.
- Formam-se **dois times**. Se a quantidade de confirmados for ímpar, o jogador restante entra como reserva do sorteio (não forma um terceiro time).

Um novo sorteio, feito pelo Admin, substitui o resultado salvo anterior.

### Modal de notificação

Ao entrar no sistema, o membro vê um modal de acordo com o próprio estado de pagamento do **próximo fut**:

- **CALOTE** (não pagou e não está agendado): modal com destaque vermelho e o texto `PAGA O FUTEBOL ARROMBADO`.
- **AGENDADO**: modal com destaque amarelo e o texto `NÃO ESQUECE DE PAGAR ATÉ O DIA dd/mm` (data anotada no agendamento).
- **PAGO**: nenhum modal.

O Admin não recebe esse modal.

## Estrutura resumida

```
GARUX/
├── Login (usuário e senha)
├── Modal de notificação (membro)
│   ├── CALOTE → "PAGA O FUTEBOL ARROMBADO"
│   ├── AGENDADO → "NÃO ESQUECE DE PAGAR ATÉ O DIA dd/mm"
│   └── PAGO → sem modal
├── Página inicial
│   ├── Data do próximo fut (calendário vertical)
│   ├── Semana de descanso (quando cancelada)
│   ├── Personalizar horário/local
│   └── Lista de pagamento
├── Membros
│   ├── Confirmados
│   ├── Reservas
│   └── Tier (Capitão / Tenente / Soldado)
├── Pagamento
│   ├── Progresso (%)
│   ├── Flag PAGO (verde)
│   ├── Flag AGENDADO + data (amarelo)
│   └── CALOTE (vermelho)
├── Sorteio
│   ├── Times do próximo fut (salvo no app)
│   └── Balanceamento por tier (máx. 1 Capitão por time)
└── Painel admin
    ├── Criar usuários
    ├── Alterar data do fut
    ├── Cancelar semana
    ├── Controlar tiers
    ├── Sortear times
    └── Marcar / remover flags de pagamento
```

## Regras de negócio

- Login somente com usuário e senha; não existe auto-cadastro.
- Novos usuários são criados exclusivamente pelo Admin.
- Admin edita data, cancela semana, altera tier, sorteia times e muda flags de pagamento.
- Membro confirma presença, visualiza informações e recebe o modal de cobrança.
- Tiers válidos: Capitão, Tenente, Soldado.
- Cancelar a semana marca descanso e aponta o próximo fut (`dd/mm`); o calendário permanece.
- Sorteio: confirmados, dois times, distribuição equilibrada de tiers, no máximo um Capitão por time, resultado persistido no app.
- Pagamento do próximo fut: PAGO (verde), AGENDADO com data (amarelo) ou CALOTE (vermelho, padrão).
- Modal do membro: vermelho se CALOTE, amarelo se AGENDADO, ausente se PAGO.
