#!/bin/sh
set -eu

: "${APP_URL:?APP_URL is required}"
: "${CRON_SECRET:?CRON_SECRET is required}"

base="${APP_URL%/}"
curl -fsS -H "Authorization: Bearer ${CRON_SECRET}" "${base}/api/cron/deactivate-guests"
