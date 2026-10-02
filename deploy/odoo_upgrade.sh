#!/usr/bin/env bash
# Safe upgrade of sales_project_lifecycle: backup -> upgrade -> resync stages.
# Usage:  sudo -u odoo ./odoo_upgrade.sh <db_name> /path/to/odoo-bin /path/to/odoo.conf
set -euo pipefail
DB="${1:?db name}"; ODOO_BIN="${2:?odoo-bin path}"; CONF="${3:?odoo.conf path}"
STAMP=$(date +%Y%m%d_%H%M%S); BACKUP="${DB}_${STAMP}.dump"

echo ">> 1/3 Backing up database to $BACKUP"
pg_dump -Fc "$DB" -f "$BACKUP"

echo ">> 2/3 Upgrading module"
"$ODOO_BIN" -c "$CONF" -d "$DB" -u sales_project_lifecycle --stop-after-init

echo ">> 3/3 Ticking stages of projects already in progress (safe to re-run)"
"$ODOO_BIN" shell -c "$CONF" -d "$DB" < "$(dirname "$0")/../tools/resync_stages.py"

echo "Done. Restore if needed:  pg_restore -d <new_db> $BACKUP"
