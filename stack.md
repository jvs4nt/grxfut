# GARUX — Stack

Referência da stack e do banco. Regras de produto estão em [doc.md](doc.md).

## Aplicação

| Camada | Escolha |
| --- | --- |
| Framework | Next.js (App Router) |
| Linguagem | TypeScript |
| UI | React + Tailwind CSS |
| Deploy | Vercel |

## Banco de dados

| Item | Escolha |
| --- | --- |
| Banco | Neon Postgres |
| ORM | Drizzle (`drizzle-orm` + `drizzle-kit`) |
| Driver | `@neondatabase/serverless` |

O projeto Neon já está provisionado. A conexão usa `DATABASE_URL`.

## Autenticação

Auth **própria**, alinhada ao spec:

- Login só com **usuário e senha**
- Senha armazenada com hash (`bcrypt` ou `argon2`)
- Sessão em cookie **httpOnly**
- Sem cadastro público — só o Admin cria usuários
- Sem OAuth, sem login social, sem recuperação por e-mail
- Role e tier vivem no banco (`admin` \| `member`; `capitao` \| `tenente` \| `soldado`)

## Variáveis de ambiente

Segredos **não** entram neste arquivo nem no git.

| Variável | Onde | Uso |
| --- | --- | --- |
| `DATABASE_URL` | `.env.local` (dev) e env da Vercel (prod) | Connection string do Neon |

`.env.local` fica no `.gitignore`. Em produção, a mesma variável é configurada no projeto Vercel.

## Modelo de dados

Tabelas previstas para o spec em [doc.md](doc.md):

**`users`**
- `id`, `username` (único), `password_hash`, `role` (`admin` \| `member`), `tier` (`capitao` \| `tenente` \| `soldado`), `created_at`

**`matches`**
- `id`, `date`, `time`, `location`, `status` (`scheduled` \| `rest`), `created_at`
- Semana cancelada permanece no calendário com `status = rest`. A home aponta para a próxima `scheduled`.

**`attendances`**
- `match_id`, `user_id`, `status` (`confirmed` \| `reserve`)
- Único por `(match_id, user_id)`. Só `confirmed` entra no sorteio.

**`payments`**
- `match_id`, `user_id`, `status` (`calote` \| `agendado` \| `pago`), `scheduled_on` (obrigatório se `agendado`)
- Default: `calote`. Progresso da tela de pagamento = percentual de `pago` no próximo jogo.

**`draws`**
- Um sorteio vigente por `match_id`. Um novo sorteio do Admin substitui o anterior.

**`draw_players`**
- `draw_id`, `user_id`, `team` (`team_a` \| `team_b` \| `draw_reserve`)
- Dois times; se o número de confirmados for ímpar, o restante vai para `draw_reserve`
- No máximo um Capitão por time

Schema SQL e migrations entram na bootstrap do app (`drizzle-kit`), não neste documento.

## Fora de escopo desta stack

- Mongo, Redis, filas
- Auth gerenciada (Clerk, Auth0, Supabase Auth)
- Recuperação de senha por e-mail
- Histórico financeiro além da flag do próximo fut
