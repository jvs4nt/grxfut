# GARUX

## Resumo
Webapp do fut: Next.js App Router, Drizzle, Neon, Tailwind. Spec em doc.md, stack em stack.md, fases em roadmap/.
Login só usuário/senha (bcrypt + cookie httpOnly `garux_session`). Role/tier vêm do banco via getSession(). Sem signup, OAuth ou recovery.
Home `/` = console de health (provisório). `/login` e `/api/health` públicos; o resto exige sessão.
Admin se cria com `npm run db:seed-admin` (creds no .env, nunca neste arquivo).
Status da fase: `**Status:** pronto|pendente` no README da pasta em roadmap/.

## Último
Fase 3: /login, JWT no cookie, seed Admin, proxy redireciona visitante.

## Pendente
4 usuários/tiers → 5 jogos/home → 6 presença → 7 pagamento → 8 sorteio → 9 deploy
