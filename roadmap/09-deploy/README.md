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
- [ ] `CRON_SECRET` em produção + agendamento do endpoint `/api/cron/deactivate-guests` (ver abaixo)
- [ ] Seed/admin de produção validado manualmente (sem commitar senha)

### Cron de convidados (Railway)

O `vercel.json` só aplica na Vercel. Em Railway, use um dos caminhos:

1. **Serviço cron** (recomendado): serviço mínimo com schedule `0 3 * * 1` (UTC; segunda 00:00 BRT ≈ `0 3 * * 1`) e comando que chama o app e sai, por exemplo:
   `curl -fsS -H "Authorization: Bearer $CRON_SECRET" "$APP_URL/api/cron/deactivate-guests"`
2. Definir `CRON_SECRET` no app **e** no serviço cron; sem `CRON_SECRET`, o endpoint aceita qualquer GET.

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
