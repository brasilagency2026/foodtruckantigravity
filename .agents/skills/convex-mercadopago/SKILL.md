---
name: convex-mercadopago
description: Guide et templates pour intégrer Mercado Pago avec Convex + Next.js. Fournit des snippets sûrs, checklist de migration, validation des webhooks et conseils pour réutiliser l'intégration dans d'autres apps.
---

# Skill: Intégration Mercado Pago (Convex + Next.js)

But: fournir une procédure reproductible, des exemples de code testés et une checklist pour éviter les erreurs courantes lors de la réutilisation de l'intégration Mercado Pago dans d'autres applications.

Langue: FR

## Quand utiliser ce skill

- Vous voulez permettre aux marchands (food trucks) d'accepter paiements Mercado Pago.
- Vous utilisez Convex pour la logique serveur (actions/mutations) et Next.js pour la partie front/webhooks.
- Vous souhaitez une intégration réutilisable, testable et sécurisée (gestion tokens par truck, webhooks signés).

## Prérequis

- Un projet Convex configuré (CONVEX_DEPLOYMENT / .env.local via `npx convex dev`).
- Un projet Next.js (ou autre) pouvant recevoir webhooks publics.
- Accès au compte Mercado Pago (sandbox / production) pour récupérer access tokens et webhook secret.

## Variables d'environnement à définir

- `MERCADO_PAGO_WEBHOOK_SECRET` — secret pour vérifier la signature des webhooks.
- `NEXT_PUBLIC_CONVEX_URL` — URL du client Convex publique (si Next.js envoie des requêtes à Convex depuis le serveur).
- (Optionnel) `MERCADO_PAGO_MODE` = `sandbox` | `production` pour templates/tests.

> Remarque: dans cet exemple on stocke le token d'accès Mercado Pago par truck dans la table `foodTrucks` (champ `mpAccessToken`). Cela permet à chaque truck d'utiliser son propre compte MP.

## Schéma recommandé (Convex)

- Table `foodTrucks` (existant dans l'exemple) doit contenir au minimum:
  - `mpAccessToken: v.optional(v.string())`
  - `mpRefreshToken: v.optional(v.string())` (si vous implémentez OAuth refresh)
  - `mpUserId: v.optional(v.string())`

Si vous ajoutez ces champs, planifiez une migration sûre (widen -> backfill -> narrow) ou utilisez `@convex-dev/migrations`.

## Pattern d'architecture

- Action Convex `createPayment` : construit la preference Checkout Pro (items, payer, external_reference) et appelle l'API Mercado Pago en utilisant le token du truck. Retourne l'URL de checkout au client.
- Route Next.js `POST /api/webhooks/mercadopago` : reçoit la notification, vérifie la signature, récupère le paiement via l'API Mercado Pago (avec le token du truck) et appelle une mutation Convex (ex: `payments.handleWebhook`) pour mettre à jour la commande.
- Mapping des statuts MP → `paymentStatus` interne, puis mise à jour du statut de la commande si nécessaire.

## Exemple d'action Convex (createPayment)

```ts
// convex/payments.ts (extrait sécurisé)
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const createPayment = action({
  args: {
    orderId: v.string(), // ou v.id('orders') si table dans le même composant
    truckId: v.string(),
    totalPrice: v.number(), // en centavos
    clientEmail: v.string(),
    clientName: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const truck = await ctx.runQuery(api.foodTrucks.getTruckById, { truckId: args.truckId });
    if (!truck?.mpAccessToken) throw new Error("Ce truck n'a pas Mercado Pago configuré.");

    const preference = {
      items: [{ title: args.description, quantity: 1, unit_price: args.totalPrice / 100, currency_id: "BRL" }],
      payer: { email: args.clientEmail, name: args.clientName },
      external_reference: args.orderId,
      notification_url: `https://YOUR_PUBLIC_HOST/api/webhooks/mercadopago`,
      back_urls: {
        success: `https://YOUR_PUBLIC_HOST/order/${args.orderId}`,
        failure: `https://YOUR_PUBLIC_HOST/order/${args.orderId}`,
        pending: `https://YOUR_PUBLIC_HOST/order/${args.orderId}`,
      },
      auto_return: "approved",
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${truck.mpAccessToken}` },
      body: JSON.stringify(preference),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`MP error: ${JSON.stringify(data)}`);

    return { checkoutUrl: data.init_point, preferenceId: data.id };
  },
});
```

> Remplacez `YOUR_PUBLIC_HOST` par la base URL publique de votre appli (ou utilisez un env var). Pour l'environnement sandbox, utilisez le token sandbox.

## Exemple de route Next.js pour webhook

```ts
// apps/web/app/api/webhooks/mercadopago/route.ts (Next.js route handler)
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import crypto from "crypto";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature") ?? "";
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET!;

    // Vérification (exemple basé sur la structure fournie par MP)
    const ts = signature.split(",").find((s) => s.startsWith("ts="))?.split("=")[1];
    const v1 = signature.split(",").find((s) => s.startsWith("v1="))?.split("=")[1];
    if (ts && v1) {
      const manifest = `id:${req.nextUrl.searchParams.get("data.id");}...`;
      const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
      if (expected !== v1) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    if (data.type !== "payment") return NextResponse.json({ ok: true });

    const paymentId = data.data?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    // lookup order by payment id (app-side query)
    const order = await convex.query(api.orders.getOrderByPaymentId, { mercadoPagoPaymentId: String(paymentId) });
    if (!order) return NextResponse.json({ ok: true });

    const truck = await convex.query(api.foodTrucks.getTruckById, { truckId: order.truckId });
    if (!truck?.mpAccessToken) return NextResponse.json({ ok: true });

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, { headers: { Authorization: `Bearer ${truck.mpAccessToken}` } });
    const payment = await mpRes.json();

    await convex.mutation(api.payments.handleWebhook, { mercadoPagoPaymentId: String(payment.id), status: payment.status });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
```

> Adaptez la vérification de signature selon le format réel fourni par Mercado Pago (le snippet ci-dessus suit l'exemple présent dans le repo).

## Mapping des statuts (exemple)

- Mercado Pago `approved` → `aprovado`
- `rejected`/`cancelled` → `recusado`
- `refunded` → `reembolsado`

Ensuite, selon votre flux métier, vous pouvez marquer la commande comme `recebido` ou `pronto`.

## Tests recommandés

1. Utiliser `sandbox` token MP pour créer une `preference` et ouvrir le `checkoutUrl`.
2. Dans la console MP (sandbox), simuler une notification webhook et vérifier la réception côté serveur.
3. Si signature présente, envoyer payload avec header `x-signature` construit correctement pour vérifier la logique.
4. Vérifier que la mutation Convex `payments.handleWebhook` met bien à jour `orders.paymentStatus` et `orders.status`.

Exemple de test curl (simuler webhook):

```bash
curl -X POST 'https://YOUR_HOST/api/webhooks/mercadopago' \
  -H 'Content-Type: application/json' \
  -H 'x-signature: ts=...,v1=...'
  -d '{ "type": "payment", "data": { "id": "TEST_PAYMENT_ID" } }'
```

## Checklist d'intégration (copy/paste)

- [ ] Ajouter les champs `mpAccessToken` (et `mpRefreshToken` si nécessaire) à la table `foodTrucks`.
- [ ] Créer l'action Convex `createPayment` (snippet fourni).
- [ ] Créer la route Next.js `POST /api/webhooks/mercadopago` (snippet fourni).
- [ ] Définir `MERCADO_PAGO_WEBHOOK_SECRET` côté serveur (env), et `NEXT_PUBLIC_CONVEX_URL`.
- [ ] Configurer l'URL webhook dans la console Mercado Pago (sandbox puis production).
- [ ] Tester le flux complet (checkout → webhook → mise à jour Convex).
- [ ] Ajouter logs et gestion d'erreurs robustes (timeouts, tokens invalides).

## Pièges courants et solutions

- Token par truck manquant → vérifier onboarding du truck (OAuth flow ou saisie du token).
- Webhook non accessible en local → utiliser ngrok/relay pour tests ou configurer environment sandbox avec URL publique.
- Mauvaise vérification de signature → utiliser la méthode et les champs exacts fournis par MP (la doc peut varier selon version).
- Utiliser `auto_return` et `back_urls` pour UX: MP retournera le client à l'URL fournie.

## Réutilisation dans d'autres apps

- Copier ce `SKILL.md` dans `.agents/skills/convex-mercadopago` d'un repo, puis copier les snippets `convex/payments.ts` et `apps/web/api/webhooks/mercadopago/route.ts` dans les chemins équivalents.
- Adapter les noms d'API (chemins `api.*`) si votre app a une structure différente.
- Toujours tester en sandbox avant de basculer en production.

## Support / FAQ

- Si les permissions MP expirent, implémenter un flux refresh token (store `mpRefreshToken` et rafraîchir via l'API MP).
- Pour les paiements en plusieurs items, passer `items` complets à la preference.

---

Si tu veux, je peux:

- 1) ajouter ce `SKILL.md` au repo (déjà fait),
- 2) créer des fichiers `templates/convex/payments.template.ts` et `templates/webhook.template.ts` dans le dossier du skill,
- 3) committer/pusher et te fournir la checklist finale.

Dis-moi si tu veux que je crée aussi les fichiers templates et que je pousse tout sur le dépôt. 