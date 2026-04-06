# AnonyMask

Extension Chrome qui anonymise automatiquement les données personnelles lors d'un copier-coller sur les sites que vous configurez.

**100% local — aucune donnée ne quitte votre appareil.**

---

## Installation

### Étape 1 — Télécharger et dézipper

Téléchargez le fichier `.zip` de l'extension et dézippez-le dans un dossier permanent sur votre ordinateur (ne le supprimez pas après, Chrome en aura besoin).

### Étape 2 — Ouvrir la page des extensions Chrome

Dans Chrome, tapez dans la barre d'adresse :

```
chrome://extensions/
```

### Étape 3 — Activer le mode développeur

En haut à droite de la page, activez le toggle **"Mode développeur"**.

### Étape 4 — Charger l'extension

Cliquez sur **"Charger l'extension non empaquetée"** (bouton en haut à gauche), puis sélectionnez le dossier dézippé — celui qui contient directement le fichier `manifest.json`.

### Étape 5 — Épingler l'extension (optionnel)

Si l'icône 🛡 n'apparaît pas dans la barre d'outils, cliquez sur l'icône puzzle 🧩 en haut à droite de Chrome, puis épinglez AnonyMask.

---

## Mise à jour

Quand une nouvelle version est disponible :

1. Remplacez les fichiers du dossier par les nouveaux
2. Allez sur `chrome://extensions/`
3. Cliquez sur l'icône de rechargement 🔄 sur la carte AnonyMask

---

## Configuration

Cliquez sur l'icône 🛡 dans la barre d'outils pour ouvrir le panneau de configuration.

**Sites concernés** — ajoutez les domaines sur lesquels l'anonymisation doit s'appliquer (ex : `claude.ai`, `app.monoutil.fr`). Un clic sur le site affiché en bas du champ permet de l'ajouter en un clic.

**Règles d'anonymisation** — activez ou désactivez chaque règle selon vos besoins. Les règles marquées ⚠ Faux positifs sont désactivées par défaut car elles peuvent affecter du texte non personnel.

**Personnaliser les sites par défaut** — modifiez le fichier `config.js` dans le dossier de l'extension, puis rechargez l'extension.

**Ajouter vos propres prénoms** — modifiez le fichier `prenoms.txt` (un prénom par ligne), puis rechargez l'extension.

---

## Données couvertes

| Règle | Exemples |
|---|---|
| Civilité + Prénom Nom | M. Jean Dupont, Madame Marie Martin |
| Civilité + Prénom NOM | Mr. Jean DUPONT, Monsieur Paul BERNARD |
| Civilité + Nom seul | Mme Dupont, Dr Lefebvre |
| Prénom (fichier) + Nom | Sophie MARTIN, Julien Dupont |
| Adresses e-mail | prenom.nom@domaine.fr |
| Téléphones français | 06 12 34 56 78, +33 6 12 34 56 78 |
| NIR (sécurité sociale) | 1 85 12 75 123 456 78 |
| IBAN | FR76 3000 6000 0112 3456 7890 189 |
| Carte bancaire | 4532 1234 5678 9012 |
| Plaque d'immatriculation | AB-123-CD |
| Dates | 01/01/1985, 15 juin 2003, lundi 12 avril 2021 |
| Adresses postales | 12 bis rue de la Paix, BP 123… |
| SIRET / SIREN | 123 456 789 00012 |
| Adresses IP | 192.168.1.1 |

---

## Fonctionnement

L'anonymisation s'applique uniquement lors d'un **Ctrl+V** dans un champ texte. Le texte original n'est jamais transmis : tout le traitement est effectué localement dans le navigateur.
