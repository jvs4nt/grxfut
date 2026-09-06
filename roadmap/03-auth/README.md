# 3. Auth e papéis

**Objetivo:** só quem tem conta entra; Admin e Membro são papéis distintos.

**Depende de:** [2. Schema](../02-schema/README.md).

## Implementar

- Tela de login (usuário e senha) — sem cadastro público, sem OAuth, sem “esqueci a senha”
- Hash de senha (`bcrypt` ou `argon2`); nunca texto puro
- Sessão em cookie **httpOnly** (e `secure` em produção)
- Middleware: rotas autenticadas exigem sessão; visitante vai para `/login`
- Seed do primeiro Admin (script ou one-off, senha fora do repo)
- Logout que invalida a sessão
- Role (`admin` \| `member`) lida do banco, não do client

Regras em [doc.md](../../doc.md).

## Testar

- [ ] Login com credenciais certas entra no app
- [ ] Senha errada ou usuário inexistente não entra (mensagem genérica, sem vazar se o user existe)
- [ ] Senha no banco está hasheada
- [ ] Cookie de sessão é httpOnly (DevTools: não acessível via `document.cookie`)
- [ ] Sem sessão, home / membros / pagamento / sorteio / admin redirecionam para login
- [ ] Não existe rota ou formulário de signup
- [ ] Seed cria um Admin; dá para logar com ele
- [ ] Logout encerra a sessão; refresh depois do logout volta ao login
- [ ] Admin e Membro recebem papéis diferentes (checagem de role no server)

## Pronto quando

Login/logout funcionam; rotas exigem sessão; não existe fluxo de cadastro aberto; o seed cria um Admin.
