# TODO - Voucher commercial → onboarding → commissions

- [ ] Ajouter champ `voucherCode` (optional) sur la table Convex `foodTrucks`
- [ ] Étendre mutation `createTruck` pour accepter `voucherCode` et l’insérer
- [ ] Modifier `apps/web/app/onboarding/page.tsx`:
  - lire `voucher` via `useSearchParams()`
  - passer `voucherCode` à `createTruck`
  - afficher le voucher dans le formulaire en mode non éditable
- [ ] Modifier `apps/web/app/dashboard/[truckId]/assinatura/page.tsx`:
  - initialiser `voucherCode` depuis `truck.voucherCode`
  - si présent, désactiver l’input + supprimer le bouton de validation manuel
- [ ] Modifier `apps/web/app/comercial/dashboard/page.tsx`:
  - ajouter un bouton “Copier link” vers `/onboarding?voucher=<code>`
- [ ] Tester manuellement :
  - commercial génère lien
  - nouveau client arrive onboarding avec voucher prérempli
  - après souscription, `commissions` se crée via webhook billing

