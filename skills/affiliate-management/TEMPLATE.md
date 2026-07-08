---
name: affiliate-management
description: Template générique pour implémenter un module d’affiliation avec inscriptions partenaires, vouchers, dashboard de suivi et commissions.
---

# Template : Module d'affiliation

## Objectif
Ce template permet d’implémenter un système d’affiliation dans un projet quelconque :
- création et gestion de partenaires commerciaux
- attribution de vouchers uniques
- suivi des comptes ou entités référées
- calcul et suivi des commissions
- espace dédié pour les partenaires et l’administration

## Modèle de données recommandé

### Table ou collection : affiliates
Champs minimum recommandés :
- id
- name
- email
- phone
- status
- voucherCode
- createdAt
- totalEarned
- totalPaid
- metadata (optionnel)

### Table ou collection : referrals / referredEntities
Champs minimum recommandés :
- id
- affiliateVoucher
- status
- createdAt
- subscriptionStatus (si applicable)
- metadata (optionnel)

## Règles métier de base

### 1. Création d’un affilié
- L’admin peut créer un affilié avec ses informations de base.
- Le voucher doit être unique.
- Le statut doit être défini à actif par défaut.
- Valider les champs obligatoires avant création.

### 2. Validation du voucher
- Lorsqu’une entité est créée avec un voucher, vérifier s’il existe et s’il est actif.
- Si le voucher est invalide, ne pas bloquer la création, mais ignorer l’affiliation.
- Si le voucher est valide, enregistrer la référence sur l’entité.

### 3. Dashboard partenaire
- Le partenaire doit pouvoir se connecter et voir ses informations de performance.
- Si l’utilisateur n’est pas reconnu comme affilié, afficher un message d’accès refusé.
- Si le compte est inactif, afficher un message de compte désactivé.
- Le dashboard doit afficher au minimum :
  - total gagné
  - total payé
  - montant en attente
  - code voucher
  - liens / QR si possible
  - listes des entités référées

### 4. Administration
- L’admin doit pouvoir :
  - créer un affilié
  - lister les affiliés
  - désactiver un affilié
  - marquer des commissions comme payées
  - visualiser les entités liées

### 5. Commissions
- Les commissions doivent être attribuées selon la logique métier du produit.
- Conserver un suivi séparé entre totalEarned et totalPaid.
- Calculer le solde en attente comme : totalEarned - totalPaid.

## Structure fonctionnelle recommandée

### Backend
- service ou module d’affiliation
- logique de création et de validation du voucher
- logique de calcul des commissions
- API ou mutation pour les actions admin

### Frontend
- page d’administration des affiliés
- page de dashboard partenaire
- composants de liste, formulaire, résumé financier et carte voucher

## Consignes d’implémentation
- Garder la séparation entre admin et partenaire.
- Préserver la sécurité et l’authentification.
- Éviter de dépendre de noms de route spécifiques.
- Adapter les interfaces en fonction du framework utilisé.
- Rendre le système extensible pour d’autres règles métier plus tard.

## Version portable du skill
Si tu veux réutiliser ce module dans un autre projet :
1. copier ce template
2. remplacer les noms de routes et entités par ceux du nouveau projet
3. adapter les champs de données au modèle existant
4. conserver la logique métier centrale
