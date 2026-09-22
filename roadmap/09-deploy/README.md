# 9. Deploy

**Objetivo:** o grupo usa o app no ar.

**Depende de:** [8. Sorteio](../08-sorteio/README.md) (MVP funcional em local).

**Status:** pendente

Código local pronto para publicar: `next build` passa; cookie já usa `secure` quando `NODE_ENV === production`; senhas ficam no `.env` / dashboard, não no git.

Falta ligar o projeto na Vercel (`npx vercel login` + `npx vercel --prod`) e definir `DATABASE_URL` e `SESSION_SECRET` no ambiente de produção.

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
- [x] Cookie `secure` em produção (`NODE_ENV === production`); HTTP sem `secure` não é o caminho de prod
- [x] `.env.local` e senhas continuam fora do git
- [x] `next build` local passa

## Pronto quando

O URL de produção autentica, lê e grava no Neon.
