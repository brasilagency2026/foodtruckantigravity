# Skill : Panneau Super Admin — Gestion Établissements, Abonnements & Programme d'Affiliation

Ce document décrit en détail l'architecture complète du panneau Super Admin tel qu'implémenté dans le projet Food Pronto. Il couvre la gestion des établissements, le système d'abonnement avec Mercado Pago, et le programme d'affiliation avec vouchers et commissions.

---

## 1. Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Backend | Convex (BaaS temps réel) |
| Auth | Clerk (email check côté frontend) |
| Paiement | Mercado Pago (Preapproval + Checkout Preferences) |
| Emails | Resend |
| Hébergement | Vercel |

---

## 2. Schéma de Base de Données (Convex)

### 2.1. Table `foodTrucks` (Établissements)

```typescript
foodTrucks: defineTable({
  // --- Infos de base ---
  name: v.string(),
  description: v.string(),
  cuisine: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  address: v.string(),
  isOpen: v.boolean(),
  ownerId: v.string(),         // ID Clerk du propriétaire
  coverPhotoUrl: v.string(),
  phone: v.string(),
  slug: v.optional(v.string()),
  state: v.optional(v.string()),
  city: v.optional(v.string()),

  // --- Champs Admin & Abonnement ---
  approvalStatus: v.optional(v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  )),
  isActive: v.optional(v.boolean()),           // Pause/activation du compte
  trialEndsAt: v.optional(v.number()),         // Timestamp fin d'essai
  nextPaymentAt: v.optional(v.number()),       // Timestamp prochain paiement
  subscriptionStatus: v.optional(v.union(
    v.literal("trial"),
    v.literal("active"),
    v.literal("past_due"),
    v.literal("canceled")
  )),
  subscriptionPlan: v.optional(v.union(
    v.literal("monthly"),
    v.literal("annual")
  )),
  mpPreapprovalId: v.optional(v.string()),     // ID abonnement Mercado Pago

  // --- OAuth Mercado Pago (pour recevoir les paiements) ---
  mpAccessToken: v.optional(v.string()),
  mpRefreshToken: v.optional(v.string()),
  mpUserId: v.optional(v.string()),
  mpExpiresAt: v.optional(v.number()),
})
  .index("by_owner", ["ownerId"])
  .index("by_slug", ["slug"])
  .index("by_city", ["state", "city"])
  .index("by_approval", ["approvalStatus"])
```

### 2.2. Table `vouchers` (Affiliés / Partenaires Commerciaux)

```typescript
vouchers: defineTable({
  code: v.string(),                    // Ex: "CARLOS10" — toujours uppercase
  partnerName: v.string(),             // Nom du commercial
  partnerCnpj: v.optional(v.string()), // CNPJ du partenaire
  partnerPhone: v.optional(v.string()),// WhatsApp pour contact
  partnerPixKey: v.optional(v.string()), // Clé PIX pour paiement commission
  isActive: v.boolean(),               // Activer/désactiver le voucher
  discountPercentage: v.number(),      // Réduction client (ex: 10%)
  commissionPercentage: v.number(),    // Commission affilié (ex: 50%)
}).index("by_code", ["code"])
```

### 2.3. Table `commissions` (Suivi des Commissions)

```typescript
commissions: defineTable({
  partnerId: v.id("vouchers"),         // Référence vers le voucher/affilié
  truckId: v.id("foodTrucks"),         // Quel établissement a payé
  amount: v.number(),                  // Montant commission en BRL
  status: v.union(
    v.literal("pending"),              // En attente de paiement par l'admin
    v.literal("paid"),                 // Payé à l'affilié
    v.literal("cancelled")
  ),
  paymentDate: v.number(),             // Date du paiement client
  paymentType: v.union(
    v.literal("monthly"),
    v.literal("annual")
  ),
  mercadopagoPaymentId: v.optional(v.string()), // Référence croisée MP
  paidAt: v.optional(v.number()),      // Date/heure du paiement à l'affilié
})
  .index("by_partner", ["partnerId"])
  .index("by_status", ["status"])
```

---

## 3. Authentification Super Admin

L'accès admin est contrôlé côté frontend uniquement via Clerk :

```typescript
const { user } = useUser();
const isAdmin = user?.primaryEmailAddress?.emailAddress === "glwebagency2@gmail.com";
if (!isAdmin) return <div>Vous n'avez pas accès.</div>;
```

**Pour reproduire :**
1. Utiliser Clerk (ou tout système auth) pour identifier l'utilisateur.
2. Comparer l'email (ou un rôle Clerk) à une liste d'admin.
3. La route `/admin` est protégée par le middleware Clerk (pas dans la liste publique).

> ⚠️ Idéalement, ajouter une vérification côté serveur dans les fonctions Convex avec `ctx.auth.getUserIdentity()`.

---

## 4. Gestion des Établissements

### 4.1. Fonctions Backend (convex/admin.ts)

```typescript
// Lister tous les établissements
export const getAllFoodTrucks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("foodTrucks").collect();
  },
});

// Mettre à jour le statut (approbation, activation, dates)
export const updateFoodTruckStatus = mutation({
  args: {
    id: v.id("foodTrucks"),
    approvalStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    isActive: v.optional(v.boolean()),
    subscriptionStatus: v.optional(v.union(v.literal("trial"), v.literal("active"), v.literal("past_due"), v.literal("canceled"))),
    trialEndsAt: v.optional(v.number()),
    nextPaymentAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const truck = await ctx.db.get(id);
    if (!truck) throw new Error("Not found");

    await ctx.db.patch(id, updates);

    // Envoyer email si le statut d'approbation change
    if (updates.approvalStatus && updates.approvalStatus !== truck.approvalStatus) {
      await ctx.scheduler.runAfter(0, internal.emails.sendStatusEmail, {
        ownerId: truck.ownerId,
        truckName: truck.name,
        newStatus: updates.approvalStatus,
      });
    }
  },
});

// Supprimer un établissement
export const deleteFoodTruck = mutation({
  args: { id: v.id("foodTrucks") },
  handler: async (ctx, args) => {
    const truck = await ctx.db.get(args.id);
    await ctx.db.delete(args.id);
    if (truck) {
      await ctx.scheduler.runAfter(0, internal.emails.sendStatusEmail, {
        ownerId: truck.ownerId, truckName: truck.name, newStatus: "deleted",
      });
    }
  },
});
```

### 4.2. Interface Admin — Onglet "Food Trucks"

L'admin peut :
- **Filtrer** : Tous / Pendentes / Aprovados
- **Trier** : Par nom, date de fin d'essai, prochain paiement
- **Modifier** : Statut d'approbation (select), Actif/Pausé (toggle), Dates d'essai et paiement (date picker)
- **Supprimer** : Avec confirmation
- **Contacter** : Lien WhatsApp direct avec le propriétaire

---

## 5. Système d'Abonnement

### 5.1. Flux de Paiement

```
Client clique "S'abonner"
    → createCheckoutUrl (Convex Action)
        → Appelle l'API Mercado Pago
        → Retourne URL de checkout
    → Client redirigé vers Mercado Pago
    → Client paie
    → Mercado Pago envoie webhook POST /api/webhooks/billing
        → Route Next.js vérifie le paiement via API MP
        → Si approuvé : appelle billing.handleBillingWebhook (mutation)
            → Met à jour nextPaymentAt (+30j ou +365j)
            → Passe subscriptionStatus à "active"
            → Active le compte (isActive: true)
            → Calcule et enregistre la commission si voucher utilisé
            → Envoie emails de confirmation
```

### 5.2. Création du Checkout (convex/billing.ts)

```typescript
export const createCheckoutUrl = action({
  args: {
    truckId: v.id("foodTrucks"),
    plan: v.union(v.literal("monthly"), v.literal("annual")),
    method: v.union(v.literal("cc"), v.literal("pix")),
    voucherCode: v.optional(v.string()),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const extRef = `${args.truckId}-${args.plan}-${args.voucherCode || "none"}`;

    if (args.plan === "monthly" && args.method === "cc") {
      // Abonnement récurrent via Preapproval
      const body = {
        reason: "Assinatura Food Pronto",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: args.totalAmount,
          currency_id: "BRL",
        },
        payer_email: payerEmail,
        back_url: backUrl,
        external_reference: extRef,
        status: "pending",
      };
      const res = await fetch("https://api.mercadopago.com/preapproval", { ... });
      return data.init_point; // URL de checkout
    } else {
      // Paiement unique (annuel ou PIX)
      const res = await fetch("https://api.mercadopago.com/checkout/preferences", { ... });
      return data.init_point;
    }
  },
});
```

### 5.3. Webhook de Facturation (app/api/webhooks/billing/route.ts)

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  const paymentId = body?.data?.id;

  // Récupérer le détail du paiement via API Mercado Pago
  const payment = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (payment.status === "approved") {
    // Déclencher la mutation Convex
    await convex.mutation(api.billing.handleBillingWebhook, {
      externalReference: payment.external_reference,
      mpPaymentId: paymentId,
      amount: payment.transaction_amount,
    });
  }
  return NextResponse.json({ ok: true });
}
```

### 5.4. Format de l'External Reference

```
{truckId}-{plan}-{voucherCode|none}
```

Exemple : `k97cx4xyz123-monthly-CARLOS10`

Cela permet au webhook d'identifier :
1. Quel établissement a payé
2. Quel plan (mensuel/annuel)
3. Quel voucher affilié a été utilisé (pour la commission)

---

## 6. Programme d'Affiliation

### 6.1. Principe

1. Le super admin crée un **voucher** lié à un affilié (nom, téléphone, clé PIX)
2. L'affilié distribue son **code promo** aux prospects (ex: "CARLOS10")
3. Le prospect utilise le code lors de l'inscription → obtient une **réduction** (ex: 10%)
4. À chaque paiement du client avec ce code → une **commission** est calculée et enregistrée
5. L'admin consulte les commissions pendantes et les marque comme "payées" après paiement PIX

### 6.2. Création d'un Voucher

```typescript
export const createVoucher = mutation({
  args: {
    code: v.string(),
    partnerName: v.string(),
    partnerPhone: v.optional(v.string()),
    partnerPixKey: v.optional(v.string()),
    isActive: v.boolean(),
    discountPercentage: v.number(),      // Ex: 10
    commissionPercentage: v.number(),    // Ex: 50
  },
  handler: async (ctx, args) => {
    // Vérifier unicité du code
    const existing = await ctx.db
      .query("vouchers")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    if (existing) throw new Error("Code déjà existant.");

    await ctx.db.insert("vouchers", {
      ...args,
      code: args.code.toUpperCase(),
    });
  },
});
```

### 6.3. Validation du Voucher (côté client, lors du checkout)

```typescript
// convex/vouchers.ts
export const getVoucherByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const voucher = await ctx.db
      .query("vouchers")
      .withIndex("by_code", (q) => q.eq("code", args.code.trim().toUpperCase()))
      .first();

    if (!voucher || !voucher.isActive) return null;
    return { discountPercentage: voucher.discountPercentage };
  },
});
```

Le frontend applique la réduction au montant affiché et envoie le `totalAmount` final + le `voucherCode` à `createCheckoutUrl`.

### 6.4. Calcul Automatique de la Commission

Intégré dans `handleBillingWebhook` :

```typescript
if (voucherCode) {
  const voucher = await ctx.db
    .query("vouchers")
    .withIndex("by_code", (q) => q.eq("code", voucherCode))
    .first();

  if (voucher && voucher.isActive) {
    // Commission = montant payé × (commissionPercentage / 100)
    const commissionAmount = amountPaid * (voucher.commissionPercentage / 100);

    await ctx.db.insert("commissions", {
      partnerId: voucher._id,
      truckId: truckId,
      amount: commissionAmount,
      status: "pending",
      paymentDate: Date.now(),
      paymentType: plan,           // "monthly" ou "annual"
      mercadopagoPaymentId: mpPaymentId,
    });

    // Notification email à l'admin
    await ctx.scheduler.runAfter(0, internal.emails.sendNewCommissionEmail, { ... });
  }
}
```

### 6.5. Paiement des Commissions par l'Admin

```typescript
export const payCommissions = mutation({
  args: { partnerId: v.id("vouchers") },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("commissions")
      .withIndex("by_partner", (q) => q.eq("partnerId", args.partnerId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const now = Date.now();
    for (const c of pending) {
      await ctx.db.patch(c._id, { status: "paid", paidAt: now });
    }
  },
});
```

### 6.6. Interface Admin — Onglet "Vouchers"

L'admin voit pour chaque voucher :
- **Code** et **Nom du partenaire**
- **WhatsApp** : lien direct pour contacter l'affilié
- **Clé PIX** : pour effectuer le virement
- **Commission pendante** : somme de toutes les commissions status="pending"
- **Bouton "Marcar como Pago"** : marque toutes les commissions pending comme paid
- **Dernier paiement** : date du dernier `paidAt`
- **Toggle Actif/Inactif** : désactiver sans supprimer
- **Supprimer** : suppression définitive

---

## 7. Notifications Email (Resend)

| Événement | Destinataire | Fichier |
|-----------|-------------|---------|
| Nouveau truck inscrit | Admin | `emails.sendNewTruckEmail` |
| Changement de statut (approved/rejected/deleted) | Propriétaire | `emails.sendStatusEmail` |
| Paiement confirmé | Propriétaire + Admin BCC | `emails.sendSubscriptionEmail` |
| Nouvelle commission à payer | Admin | `emails.sendNewCommissionEmail` |

Configuration requise :
- Variable d'env `RESEND_API_KEY`
- Variable d'env `CLERK_SECRET_KEY` (pour récupérer l'email du propriétaire)
- Domaine vérifié dans Resend (ex: `foodpronto.com.br`)

---

## 8. Variables d'Environnement Requises

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOY_KEY=prod:xxx

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxx         # Production
MERCADO_PAGO_ACCESS_TOKEN_TEST=TEST-xxx       # Sandbox

# Resend (Emails)
RESEND_API_KEY=re_xxx
```

---

## 9. Reproduire dans un Autre Projet — Checklist

### Étape 1 : Schéma

1. Créer les 3 tables : `establishments` (ou équivalent), `vouchers`, `commissions`
2. Ajouter les champs admin/subscription à la table principale
3. Indexer `vouchers.by_code` et `commissions.by_partner`

### Étape 2 : Backend Admin

1. `getAllEstablishments` — query pour lister tout
2. `updateStatus` — mutation pour modifier statut, dates, activation
3. `deleteEstablishment` — mutation avec notification
4. CRUD vouchers : `createVoucher`, `updateVoucher`, `deleteVoucher`
5. `payCommissions` — marquer pending → paid

### Étape 3 : Billing / Abonnement

1. `createCheckoutUrl` — action qui appelle l'API de paiement (Stripe, MP, etc.)
2. Encoder `{entityId}-{plan}-{voucherCode}` dans l'external reference
3. Webhook POST qui reçoit la notification de paiement
4. `handleBillingWebhook` — mutation qui :
   - Prolonge l'abonnement (nextPaymentAt)
   - Active le compte
   - Calcule la commission si voucher présent
   - Insère dans `commissions`

### Étape 4 : Voucher (côté client)

1. Input "Code promo" dans le formulaire de checkout
2. Query `getVoucherByCode` pour valider et récupérer le % de réduction
3. Appliquer la réduction au montant affiché
4. Envoyer le `voucherCode` + `totalAmount` à `createCheckoutUrl`

### Étape 5 : Frontend Admin

1. Page protégée par auth (vérification rôle/email)
2. Onglets : Établissements | Vouchers | Abonnements
3. Table avec filtres, tri, actions inline
4. Formulaire de création de voucher
5. Bouton "Marquer comme payé" pour les commissions

### Étape 6 : Emails

1. Email admin quand nouvel établissement s'inscrit
2. Email propriétaire quand statut change
3. Email confirmation paiement
4. Email admin quand nouvelle commission à payer

---

## 10. Formule de Commission

```
Prix de base (ex: R$200/mois)
- Réduction voucher (ex: 10%) → Prix client = R$180
Commission = Prix client × commissionPercentage (ex: 50%) = R$90
```

L'affilié touche R$90 à chaque paiement mensuel du client qu'il a apporté, tant que l'abonnement est actif et que le code voucher est lié.

---

## 11. Points d'Attention

1. **Sécurité** : Les fonctions backend admin n'ont pas de vérification serveur. Ajouter `ctx.auth.getUserIdentity()` + vérification rôle dans chaque query/mutation admin.
2. **Commissions récurrentes** : Chaque paiement (mensuel ou annuel) génère une nouvelle ligne commission. L'affilié est rémunéré à vie tant que le client paie.
3. **Paiement manuel** : L'admin paie l'affilié via PIX hors plateforme, puis clique "Marquer comme payé" dans le panneau.
4. **Désactivation voucher** : Mettre `isActive: false` empêche les nouveaux clients d'utiliser le code, mais les commissions existantes continuent d'être générées pour les clients déjà liés.
5. **Mode test** : Le système supporte un mode sandbox Mercado Pago avec un token séparé pour tester sans vrais paiements.
