Food Truck Alert - Onboarding

## Objectif
Corriger le flux d’inscription **commercial** afin que le lien reçu par le commercial
`https://www.foodpronto.com.br/sign-up?email=...` mène au bon rôle / panel.

## Contexte (actuel)
- La page `apps/web/app/sign-up/[[...sign-up]]/page.tsx` rend le composant Clerk `SignUp` avec `fallbackRedirectUrl="/onboarding"`.
- Le panel commercial est `/comercial/dashboard`.
- La redirection “commercial” est actuellement gérée par la page `apps/web/app/onboarding/page.tsx`, via `api.admin.getPartnerDashboard`.

## Changement proposé
1. Détecter sur le signup quand l’utilisateur doit être “commercial”.
2. Rediriger directement vers `/comercial/dashboard` après signup (ou au moins vers `/onboarding` en conservant le mapping partner).

## Où modifier
- `apps/web/app/sign-up/[[...sign-up]]/page.tsx`
  - ajouter une logique pour lire le query param `email`.
  - injecter une `fallbackRedirectUrl` dynamique (au lieu d’une constante `/onboarding`).

## Note importante
Ce README décrit la correction à faire. Les modifications de code associées doivent être appliquées dans le dépôt avant release.

