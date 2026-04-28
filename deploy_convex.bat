@echo off
set "CONVEX_DEPLOY_KEY=prod:brilliant-turtle-251|eyJ2MiI6IjU0OTQxMzQ1MTZmMTRkMGFhZTcwMjhiMDJlYzE1OGFlIn0="
node node_modules\convex\bin\main.js deploy --functions apps/web/convex
