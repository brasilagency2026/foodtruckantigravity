# TODO: Commercial signup redirect

## 1) Comprendre le mapping “commercial”
- [ ] Vérifier (dans Convex) comment `api.admin.getPartnerDashboard` détermine l’accès (actuellement basé sur `identity.email` et vouchers `partnerEmail`).

## 2) Rendre le signup Clerk redirigeant
- [ ] Modifier `apps/web/app/sign-up/[[...sign-up]]/page.tsx` pour calculer une `fallbackRedirectUrl` selon le query param `email`.
  - [ ] Si `email` correspond à un partenaire existant, fallback vers `/comercial/dashboard`.
  - [ ] Sinon, fallback vers `/onboarding`.

## 3) (Optionnel) Ajout d’API légère / query côté client
- [ ] Si besoin, créer un endpoint/convex query pour savoir si l’email est “partner”.

## 4) Nettoyage
- [ ] Supprimer `README_TEMP_EMAIL_COMMERCIAL.md`.

## 5) Tests manuels
- [ ] Tester le lien `.../sign-up?email=...` et confirmer que l’utilisateur arrive bien sur `/comercial/dashboard`.

