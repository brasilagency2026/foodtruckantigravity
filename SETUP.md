# 🚀 Guia de Setup — Food Truck Alert

## 1. Criar repositório e primeiro push

```bash
# Dentro da pasta food-truck-alert/
git init
git add .
git commit -m "feat: initial commit — Food Truck Alert"

# Criar repo no seu GitHub (github.com → New repository)
# Nome: food-truck-alert | Privado | Sem README
git remote add origin https://github.com/[SEU-USUARIO]/food-truck-alert.git
git branch -M main
git push -u origin main
```

---

## 2. Configurar Vercel

1. Acesse **vercel.com** → **Add New Project**
2. Importar o repositório `food-truck-alert`
3. Configurar:
   - **Root Directory:** `apps/web`
   - **Framework Preset:** Next.js
   - **Build Command:** `cd ../.. && yarn turbo build --filter=web`
   - **Install Command:** `cd ../.. && yarn install`
4. Adicionar todas as **Environment Variables** (copiar do `.env.example`)
5. Clicar em **Deploy** ✅

---

## 3. Configurar secrets no GitHub Actions

Em **Settings → Secrets → Actions → New repository secret**:

| Secret | Onde encontrar |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | vercel.com → Settings → General |
| `VERCEL_PROJECT_ID` | Projeto no Vercel → Settings → General |
| `CONVEX_DEPLOY_KEY` | dashboard.convex.dev → Settings → Deploy Keys |
| `EXPO_TOKEN` | expo.dev → Account → Access Tokens |

---

## 4. Configurar Convex

```bash
yarn install
npx convex dev
# Schema será criado automaticamente

# Para produção:
npx convex deploy
```

---

## 5. Configurar Deep Linking (após publicar o app)

Após obter seu domínio Vercel e publicar o app nas stores, atualize:

**`apps/mobile/app.json`** — substituir `SEU-DOMINIO.vercel.app`:
```json
"associatedDomains": ["applinks:SEU-DOMINIO.vercel.app"]
```

**`apps/web/public/.well-known/apple-app-site-association`** — substituir `TEAM_ID`:
```json
"appID": "SEU_TEAM_ID.com.foodtruckalert"
```

**`apps/web/public/.well-known/assetlinks.json`** — substituir pelo SHA256:
```bash
eas credentials --platform android
# Copiar o SHA256 Fingerprint
```

---

## 6. Fluxo de trabalho diário

```bash
# Fazer alterações → commitar → push
git add .
git commit -m "feat: descrição da mudança"
git push

# GitHub Actions executa automaticamente:
# ✅ Lint + testes
# ✅ Deploy Convex (backend)
# ✅ Deploy Vercel (web)
# ✅ Build mobile (EAS)
```
