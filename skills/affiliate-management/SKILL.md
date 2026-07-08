---
name: affiliate-management
description: Gestion complète de la partie affiliation d’un produit SaaS/marketplace : inscription commerciale, dashboard partenaire, administration des vouchers, commissions, échéances et suivi des comptes référés.
---

# Skill : Gestion de l'affiliation

## Objectif

Ce skill est conçu pour être réutilisé dans un autre projet, même si l’architecture change légèrement. Il couvre la logique métier de base de l’affiliation et peut être adapté à d’autres routes, noms de fichiers ou frameworks.

## Réutilisation dans un autre projet

Pour utiliser ce skill dans un autre dossier/projet :
1. Copier le dossier .github/skills/affiliate-management dans la racine du nouveau projet.
2. Adapter les chemins de fichiers mentionnés au nouveau projet.
3. Remplacer les noms de routes spécifiques (ex. /admin/superadmin, /comercial/dashboard) par les routes équivalentes du nouveau projet.
4. Adapter les entités métier si le modèle diffère : utilisateurs, partenaires, vouchers, souscriptions, commissions.
5. Conserver la logique métier centrale : création d’affiliés, validation de voucher, suivi de commissions, séparation des rôles admin/partenaire.

> Ce skill est volontairement centré sur les responsabilités fonctionnelles, pas uniquement sur les noms de fichiers du projet actuel.


Cette skill couvre l’ensemble du module affiliation du projet :
- inscription et onboarding des partenaires commerciaux
- panneau d’administration superadmin pour gérer les affiliés
- dashboard partenaire pour consulter ses vouchers, restaurants et commissions
- logique métier liée aux vouchers, échéances de souscription et commissions

## Contexte technique du projet

Ce site est une application Next.js avec:
- frontend App Router
- backend Convex
- authentification Clerk
- administration via une page superadmin

Le module affiliation repose principalement sur:
- la table Convex affiliates
- la table restaurants avec le champ affiliateVoucher
- la page /admin/superadmin pour l’administration
- la page /comercial/dashboard pour le partenaire

## Architecture à respecter

### Backend / données
- Utiliser Convex pour toutes les opérations d’affiliation.
- Travailler avec la table affiliates et le champ affiliateVoucher sur les restaurants.
- Respecter la logique de validation des vouchers actifs.
- Gérer les commissions via les champs totalEarned et totalPaid.

### Frontend
- Les écrans principaux sont :
  - /admin/superadmin
  - /comercial/dashboard
- Les composants associés sont dans components/affiliate/.

## Règles métier essentielles

### 1. Inscription commerciale
- Un partenaire commercial est créé via l’admin avec ses informations : nom, e-mail, téléphone, CNPJ, voucher, PIX key.
- Le CNPJ doit être valide, idéalement au format 14 chiffres.
- Le voucher doit être unique.
- Le partenaire créé doit avoir un statut actif par défaut.

### 2. Validation du voucher au moment de l’inscription d’un restaurant
- Si un restaurant est créé avec un voucher affilié, vérifier qu’il existe et qu’il est actif.
- Si le voucher n’est pas valide, ne pas bloquer la création du restaurant, mais ne pas enregistrer le lien d’affiliation.
- Si le voucher est valide, enregistrer le voucher sur le restaurant dans affiliateVoucher.

### 3. Dashboard partenaire
- Le partenaire doit pouvoir se connecter via Clerk et accéder à son dashboard grâce à son e-mail.
- Si l’e-mail ne correspond à aucun affilié enregistré, afficher un message d’accès refusé.
- Si le compte est inactif, afficher un message de compte désactivé.
- Le dashboard doit afficher :
  - total gagné
  - total payé
  - commission pendante
  - voucher de parrainage
  - QR code et lien partageable
  - liste des restaurants référés

### 4. Administration superadmin
- Le superadmin doit pouvoir :
  - créer un affilié
  - lister les affiliés
  - désactiver un affilié
  - supprimer un affilié
  - marquer une commission comme payée
- La table d’administration doit exposer les données suivantes :
  - nom
  - voucher
  - nombre de restaurants par statut
  - revenus 30 jours (si disponible)
  - commission pendante

### 5. Commissions
- La commission est liée à chaque restaurant actif référé.
- En général, la logique est de créditer la commission à l’affilié lors de l’activation ou du renouvellement de l’abonnement.
- Le montant de commission doit être suivi par les champs totalEarned et totalPaid.
- Le solde pending correspond à totalEarned - totalPaid.

## Fichiers clés du projet

### Backend
- convex/affiliates.ts
- convex/schema.ts
- convex/restaurants.ts
- convex/admin.ts
- app/admin/superadmin/affiliate-actions.ts

### Frontend
- app/admin/superadmin/page.tsx
- app/comercial/dashboard/page.tsx
- components/affiliate/AffiliateTable.tsx
- components/affiliate/AffiliateCreateModal.tsx
- components/affiliate/CommissionPaymentModal.tsx
- components/affiliate/PartnerFinancialSummary.tsx
- components/affiliate/PartnerVoucherCard.tsx
- components/affiliate/PartnerRestaurantList.tsx

## Consignes de travail pour l’agent

Quand tu intervenes sur cette partie :
1. Comprendre d’abord le flux complet : création d’affilié → voucher → inscription restaurant → commission.
2. Travailler en priorité sur les fichiers Convex et les pages d’admin/dashboard.
3. Préserver la logique existante de sécurité et d’authentification.
4. Prioriser les changements qui améliorent :
   - onboarding commercial
   - visibilité des commissions
   - suivi des restaurants liés
   - cohérence des statuts actif/inactif
5. Si une évolution touche l’affiliation, vérifier aussi l’impact sur :
   - l’inscription restaurant
   - la superadmin
   - le tableau de bord partenaire

## Points d’attention

- Ne pas casser l’accès superadmin.
- Ne pas supprimer d’éléments critiques sans vérifier les dépendances.
- Les modifications liées à la logique de commission doivent rester cohérentes avec les statuts de souscription.
- Si un voucher est invalide ou un affilié inactif, la création du restaurant ne doit pas échouer, mais l’affiliation doit être ignorée.

## Résumé opérationnel

En pratique, cette skill sert à:
- créer et administrer des affiliés commerciaux
- gérer les vouchers de parrainage
- suivre les restaurants attachés à chaque partenaire
- calculer et suivre les commissions à payer
- offrir un espace dédié au partenaire commercial pour suivre ses performances
