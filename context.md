# GARUX

## Resumo
Webapp do fut: Next.js App Router, Drizzle, Neon, Tailwind. Spec em doc.md, stack em stack.md, fases em roadmap/.
Login só usuário/senha (bcrypt + cookie httpOnly `garux_session`, `secure` em produção). Role/tier vêm do banco via getSession(). Sem signup, OAuth ou recovery.
Rotas: `/` home do fut, `/membros`, `/pagamento`, `/sorteio`. `/login` e `/api/health` públicos; o resto exige sessão. `/dev` e `/roadmap` são internos.
Admin cria, edita (usuário/senha) e exclui membros em `/membros` (só role member). Seed inicial: `npm run db:seed-admin` (creds no .env).
Status da fase: `**Status:** pronto|pendente` no README da pasta em roadmap/.

## Último
Usuário tem nome de exibição (cadastro/edição). Listas e campo mostram o nome; Elenco mostra nome + usuário. Login e nav seguem no usuário. Registros antigos copiaram o username.

## Pendente
Conectar GitHub no serviço Railway para deploys automáticos; 9 deploy Vercel ainda no roadmap.
