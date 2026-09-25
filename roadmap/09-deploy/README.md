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
- [ ] Cron Schedule `0 3 * * 1` no serviço `guest-cron` (Railway Settings; ver abaixo)
- [ ] Seed/admin de produção validado manualmente (sem commitar senha)

### Cron de convidados (Railway)

O `vercel.json` só aplica na Vercel. Em Railway, use um dos caminhos:

1. Serviço **`guest-cron`** no mesmo projeto: código em `cron/` (Dockerfile + `run.sh`). Variáveis: `APP_URL` (URL pública do app), `CRON_SECRET` (referência `${{grxfut.CRON_SECRET}}` ou o mesmo valor).
2. Em **Settings → Cron Schedule** do `guest-cron`, usar `0 3 * * 1` (UTC; segunda 00:00 BRT ≈ `0 3 * * 1`). O container chama `GET /api/cron/deactivate-guests` e encerra.
3. Rota pública no proxy (`src/proxy.ts`); sem `CRON_SECRET`, o endpoint aceita qualquer GET; com secret, exige `Authorization: Bearer`.

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
