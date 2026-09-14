# 4. Usuários e tiers

**Objetivo:** o grupo existe no sistema e cada jogador tem tier.

**Depende de:** [3. Auth](../03-auth/README.md).

**Status:** pronto

## Implementar

- Admin cria usuário: username, senha, role (`admin` \| `member`), tier
- Admin altera tier: `Capitão` / `Tenente` / `Soldado`
- Membro visualiza o próprio tier e o dos demais
- Membro **não** cria usuário e **não** altera tier
- Ações de escrita validadas no server (role Admin)

## Testar

- [x] Admin logado cria um Membro e consegue logar com essa conta
- [x] Username duplicado é recusado
- [x] Admin muda o tier de um jogador; a mudança aparece para Admin e Membro
- [x] Tiers aceitos só: Capitão, Tenente, Soldado
- [x] Membro autenticado não vê (ou não consegue usar) o formulário de criar usuário
- [x] POST/API de criar usuário ou alterar tier com sessão de Membro retorna 403
- [x] Lista de membros mostra o tier de cada um
- [x] Senha do novo usuário é hasheada (igual à auth)

## Pronto quando

Um Admin logado cria um Membro e muda o tier; o Membro não consegue criar usuário nem alterar tier.
