# 🍔 Food Pronto

App mobile (Android + iOS) + painel web para food trucks com cardápio digital, pedidos em tempo real, alertas sonoros e vibração quando o pedido fica pronto.

## 🏗️ Stack

| | Tecnologia |
|---|---|
| Mobile | React Native + Expo |
| Web (admin + homepage) | Next.js → Vercel |
| Backend + DB | Convex (tempo real) |
| Autenticação | Clerk |
| Storage de fotos | Cloudflare R2 |
| Pagamentos | Mercado Pago |
| Mapa | Google Maps |
| CI/CD | GitHub Actions |

## 📁 Estrutura

```
food-truck-alert/
├── apps/
│   ├── mobile/          # Expo — cliente e cozinha
│   └── web/             # Next.js — homepage + admin
├── packages/
│   └── shared/
│       ├── convex/      # schema + queries + mutations
│       ├── types/       # TypeScript compartilhado
│       └── utils/       # slug, upload R2, QR Code
└── .github/workflows/   # CI/CD automático
```

## 🚀 Setup

Consulte o arquivo `SETUP.md` para instruções completas.

### Instalação rápida

```bash
yarn install
cp .env.example .env.local
# Preencher .env.local com suas credenciais
npx convex dev
yarn dev
```

## 🔑 Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha todas as variáveis. Veja comentários no arquivo para onde obter cada chave.

## 📱 Funcionalidades

- 🗺️ Mapa de food trucks próximos com filtro por culinária
- 📋 Cardápio digital via QR Code (web + app)
- 💳 Pagamento Pix, crédito e débito via Mercado Pago
- ⚡ Pedidos e status em tempo real (Convex)
- 🔔 Alerta sonoro + vibração quando pedido fica pronto
- 👨‍🍳 Painel da cozinha ao vivo
- 🔗 URL SEO-friendly por estado/cidade/truck
- 📊 Dashboard com faturamento e estatísticas
"# foodtruckantigravity" 
