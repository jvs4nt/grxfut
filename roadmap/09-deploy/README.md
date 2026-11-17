# 9. Deploy

**Objetivo:** o grupo usa o app no ar.

**Depende de:** [8. Sorteio](../08-sorteio/README.md) (MVP funcional em local).

**Status:** pendente

Código publicado no **Railway** (`jvs4nt/grxfut` → branch `master`). URL: `https://grxfut-production.up.railway.app`. `next build` passa; cookie usa `secure` quando `NODE_ENV === production`; segredos ficam no dashboard Railway / Neon, não no git.

## Implementar

- [x] Projeto Railway com deploy automático via GitHub
- [x] `DATABASE_URL` e `SESSION_SECRET` no ambiente de produção
- [x] Cookie de sessão com `secure` em HTTPS
- [x] Build de produção (`next build`) passando
- [x] `CRON_SECRET` em produção no serviço `grxfut`
- [ ] Cron Schedule `0 3 * * 1` no serviço `guest-cron` (`cron/railway.toml` se o root for `cron/`; senão, Railway Settings)
- [ ] Seed/admin de produção validado manualmente (sem commitar senha)

### Cron de convidados (Railway)

O schedule fica em `cron/railway.toml` (`0 3 * * 1`, UTC). O Railway só lê esse arquivo se o root do serviço `guest-cron` for a pasta `cron/`. Se o root for outro, o schedule continua no painel (Settings → Cron Schedule).

1. Serviço **`guest-cron`** no mesmo projeto: código em `cron/` (Dockerfile + `run.sh`). Variáveis: `APP_URL` (URL pública do app), `CRON_SECRET` (referência `${{grxfut.CRON_SECRET}}` ou o mesmo valor).
2. O container chama `GET /api/cron/deactivate-guests` e encerra.
3. Rota pública no proxy (`src/proxy.ts`). O endpoint exige `Authorization: Bearer` com `CRON_SECRET`. Sem a variável, ou com o header errado, responde 401 e não altera o banco.

## Testar

- [x] Deploy no Railway conclui sem erro de build
- [x] `/api/health` em produção: app + Neon OK
- [ ] Login no URL de produção com admin de prod
- [ ] Criar usuário, editar jogo, confirmar presença, marcar pagamento e sortear gravam no Neon
- [ ] Refresh no URL de produção mantém sessão e dados
- [x] Cookie `secure` em produção (`NODE_ENV === production`)
- [x] `.env.local` e senhas fora do git
- [x] `next build` local passa
- [ ] Cron de guests dispara em produção (segunda-feira ou teste manual com `Authorization: Bearer`)

## Pronto quando

O URL de produção autentica, lê e grava no Neon, e a rotina de guests está protegida e agendada.
