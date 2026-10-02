# Go-live guide — Otomater Sales & Project Lifecycle

Two parts: the **Odoo module** (`sales_project_lifecycle`) and the **Next.js app** (`otm-frontend`).
Example domains: Odoo at `erp.example.com`, app at `app.example.com`. Replace with yours.

## 0. Before you touch anything
1. Back up the database and filestore:
   `sudo -u odoo pg_dump -Fc YOURDB > /backup/YOURDB_$(date +%F).dump`
   `tar czf /backup/filestore_$(date +%F).tgz /var/lib/odoo/.local/share/Odoo/filestore/YOURDB`
2. Do the first run on a **copy** (restore the dump into a test DB) and check it, then repeat on live.

## 1. Odoo module upgrade
```
cp -r sales_project_lifecycle /path/to/custom/addons/        # replace the old folder
sudo systemctl stop odoo
sudo -u odoo odoo-bin -c /etc/odoo.conf -d YOURDB -u sales_project_lifecycle --stop-after-init
sudo systemctl start odoo
```
Then, once, to tick stages on projects that were already in progress:
```
sudo -u odoo odoo-bin shell -c /etc/odoo.conf -d YOURDB < otm-frontend/tools/resync_stages.py
```
In Odoo → Settings → Sales Lifecycle you can now switch on **Create Project Automatically**
(project is created as soon as the agreement is completed and the advance received) and set each
team's **Monthly Sales Target** (Sales Teams form).

Odoo settings that matter behind a proxy (`/etc/odoo.conf`): `proxy_mode = True`, `list_db = False`,
`workers = 4` (or more), and `dbfilter = ^YOURDB$`.

## 2. Next.js app
```
cd otm-frontend
cp .env.local.example .env.local      # then edit: ODOO_URL=http://127.0.0.1:8069  ODOO_DB=YOURDB
npm install
npm run build
npm start -- -p 3000
```
Keep it running with systemd — `/etc/systemd/system/otm-app.service`:
```
[Unit]
Description=Otomater app
After=network.target

[Service]
WorkingDirectory=/opt/otm-frontend
ExecStart=/usr/bin/npm start -- -p 3000
Restart=always
User=odoo
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
`sudo systemctl daemon-reload && sudo systemctl enable --now otm-app`

The browser never talks to Odoo directly: the app's server forwards calls, so Odoo can stay private
(listening on 127.0.0.1 only) and only the app is public.

## 3. HTTPS with nginx (also needed for "install on phone")
`/etc/nginx/sites-available/otm-app`:
```
server {
    server_name app.example.com;
    client_max_body_size 25m;                 # payment-proof uploads
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```
```
sudo ln -s /etc/nginx/sites-available/otm-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d app.example.com
```
Cookies are marked secure automatically once the site is served over HTTPS.

## 4. Test with real users (one of each role) before announcing
| Role | Check |
|---|---|
| Executive | sees only own leads; "Next:" button on a lead; payment proof upload is not offered |
| Sales head | team performance chart, team target ring, approvals |
| Finance | confirm payment with proof + date |
| Project head | tasks → QC → deployment buttons |
| Developer / QC | only own tasks / QC rounds |
| Admin | all teams, filters, targets |
Also try: Ctrl+K search, bell notifications, CSV export, dark mode, phone (Add to Home Screen).

## 5. Updating later
Replace files, `npm install` (only if package.json changed), `npm run build`, `sudo systemctl restart otm-app`.
Module: repeat step 1.

## 6. Rollback
Restore the dump: `dropdb YOURDB && pg_restore -C -d postgres /backup/YOURDB_DATE.dump`, put back the old module folder and old app folder, restart both.
