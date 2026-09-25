# GARUX

## Resumo
Webapp do fut: Next.js App Router, Drizzle, Neon, Tailwind. Spec em doc.md, stack em stack.md, fases em roadmap/.
Login só usuário/senha (bcrypt + cookie httpOnly `garux_session`, `secure` em produção). Role/tier vêm do banco via getSession(). Sem signup, OAuth ou recovery.
Rotas: `/` home do fut, `/membros`, `/pagamento`, `/caixa`, `/sorteio`, `/jogo`, `/estatisticas`. `/login` e `/api/health` públicos; o resto exige sessão. `/dev` e `/roadmap` são internos. Guest não entra em `/jogo` nem em `/estatisticas`.
Admin cria, edita (usuário/senha) e exclui membros em `/membros` (só role member). Seed inicial: `npm run db:seed-admin` (creds no .env).
`/caixa`: membros leem saldo/extrato; só admin adiciona, retira ou edita (lápis = “Edição manual”).
Deploy: Railway `grxfut-production.up.railway.app`, repo `jvs4nt/grxfut@master`.
Status da fase: `**Status:** pronto|pendente` no README da pasta em roadmap/.

## Último
`/estatisticas` lista o ranking por pontos, com gols, assistências e defesas, nas abas Mês atual e All-time.

## Pendente
Fase 9: checklist manual em prod (login, fluxos CRUD); `CRON_SECRET` + cron Railway para guests (`vercel.json` não vale em Railway).
Fase 10: checklist manual do jogo ao vivo (iniciar, eventos, encerrar, auditoria).
