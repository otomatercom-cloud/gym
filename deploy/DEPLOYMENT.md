# Going live – checklist

## 0. Before anything
- [ ] Backup the Odoo database and filestore.
- [ ] Try the upgrade on a **copy** of the database first.

## 1. Odoo module
1. Replace the `sales_project_lifecycle` folder in your addons path.
2. Run `deploy/odoo_upgrade.sh <db> <odoo-bin> <odoo.conf>` (backup → `-u` → stage resync).
3. Restart the Odoo service. Keep Odoo private (bind to 127.0.0.1 or firewall 8069) – only nginx is public.

## 2. Frontend (choose one)
**Docker:** edit `deploy/docker-compose.yml` (ODOO_URL, ODOO_DB) → `docker compose -f deploy/docker-compose.yml up -d --build`

**systemd:** follow the comments in `deploy/otm-frontend.service`.

Environment variables
| Name | Meaning |
|---|---|
| `ODOO_URL` | Odoo address as seen by the frontend server |
| `ODOO_DB` | database name (leave empty only if Odoo has a single database) |
| `NEXT_PUBLIC_IDLE_MINUTES` | auto sign-out after inactivity (default 30, `0` = off; set at build time) |

## 3. HTTPS + domain
Copy `deploy/nginx.conf`, set your domain, run `certbot --nginx -d <domain>`. HTTPS is required for "install app" on phones and marks the session cookie Secure.

## 4. Users
Create one test user per role in Odoo (executive, sales head, project head, finance, developer, admin) and log in as each: the dashboard, lists and buttons must show only that role's data.

## 5. Built-in protections
- 5 wrong passwords per login+IP in 10 minutes → locked for the rest of that window.
- Auto sign-out after 30 min idle.
- Session cookie is httpOnly; Odoo roles and record rules remain the real access control.
- The login limiter is in memory: it resets when the app restarts (fine for one instance).
