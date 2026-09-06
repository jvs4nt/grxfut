# 1. Bootstrap

**Objetivo:** projeto Next.js rodando e falando com o Neon.

**Depende de:** nada. Primeira fase.

## Implementar

- Next.js (App Router) + TypeScript + React
- `.env.local` com `DATABASE_URL` (fora do git)
- `.gitignore` cobrindo `.env*`
- Drizzle (`drizzle-orm` + `drizzle-kit`)
- Driver `@neondatabase/serverless`
- Client Drizzle apontando para o Neon via `DATABASE_URL`
- Scripts de `dev`, `build` e `drizzle-kit` no `package.json`

Detalhes da stack em [stack.md](../../stack.md).

## Testar

- [ ] `npm run dev` / `pnpm dev` sobe sem erro
- [ ] TypeScript compila (`tsc` / `next build` em modo typecheck)
- [ ] `.env.local` não é commitado (`.gitignore` cobre `.env*`)
- [ ] `DATABASE_URL` é lida no server, não no client
- [ ] Uma query simples (ex. `SELECT 1`) via Drizzle responde no Neon
- [ ] Sem `DATABASE_URL`, a conexão falha de forma explícita (não crash silencioso)

## Pronto quando

O app sobe localmente e o client Drizzle conecta no Neon sem erro.
