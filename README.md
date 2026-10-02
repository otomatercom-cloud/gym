# Otomater Lifecycle – Next.js frontend

A friendly web app over the Odoo 19 module `sales_project_lifecycle`:
**lead → demo → estimate → deal lock → agreement → advance → project → development → QC → deployment → training → payments → review → closure → services & renewals.**

Nothing is duplicated: every button, role check and prerequisite still runs **inside Odoo**. The app only calls the module's own
methods (`action_*`) through a small server-side proxy, so security (teams, groups, record rules) stays exactly as in Odoo.

## Run
```bash
cp .env.local.example .env.local      # set ODOO_URL (and ODOO_DB if you have several databases)
npm install
npm run dev                            # http://localhost:3000     (production: npm run build && npm start)
```
Log in with any Odoo user that has a *Sales & Project Lifecycle* group. Each person only sees what Odoo lets them see.

## Screens
| Area | Pages |
|---|---|
| Dashboard | role based KPIs (click a KPI → filtered list), pipeline bars, team tables |
| Sales | Leads (with the 13-step checklist), Demos, Estimates (services + customizations, discount approval), Deals, Agreements |
| Finance | Payments (request / confirm), Commissions (earn → approve → pay), Wallets |
| Projects | Project board, Projects (stage, tasks, QC, issues, deployments, training, payments, reviews tabs), Tasks, QC rounds, Issues, Deployments, Training, Reviews |
| Clients | Customer 360, Client services, Renewals, Servers, Integrations |

Every record page has: the status buttons that are valid *right now*, an editable form, related tabs with inline add + row buttons,
the audit trail (non-editable transition history) and internal notes.

## How it stays in sync with the module
* `lib/schema.generated.ts` is generated from the module's transition matrices (which button is allowed from which state).
* `lib/config.ts` lists columns / form fields / tabs per object. Labels, types and selections are read live from Odoo (`fields_get`).
* To add a new object: add one entry to `CONFIG`; list, form, tabs, buttons and navigation appear automatically.
* If you add a transition in the module, regenerate the schema (see `tools/dump_schema.py`, run in `odoo-bin shell`).

## Security notes
* The Odoo session id lives in an **httpOnly** cookie; the browser never talks to Odoo directly (no CORS needed).
* Put the app behind HTTPS in production and set `ODOO_URL` to the internal Odoo address.
