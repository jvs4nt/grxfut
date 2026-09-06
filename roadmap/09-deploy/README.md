# 9. Deploy

**Objetivo:** o grupo usa o app no ar.

**Depende de:** [8. Sorteio](../08-sorteio/README.md) (MVP funcional em local).

## Implementar

- Projeto na Vercel (Next.js App Router)
- `DATABASE_URL` no ambiente de produção da Vercel (não no repo)
- Seed/Admin de produção sem commitar senha
- Cookie de sessão com `secure` em HTTPS
- Build de produção (`next build`) passando

## Testar

- [ ] Deploy na Vercel conclui sem erro de build
- [ ] `DATABASE_URL` de produção aponta para o Neon e não aparece no client bundle
- [ ] Login no URL de produção funciona com o Admin de prod
- [ ] Criar usuário, editar jogo, confirmar presença, marcar pagamento e sortear gravam no Neon
- [ ] Refresh no URL de produção mantém sessão e dados
- [ ] HTTP sem cookie `secure` não é o caminho de prod (só HTTPS)
- [ ] `.env.local` e senhas continuam fora do git

## Pronto quando

O URL de produção autentica, lê e grava no Neon.
