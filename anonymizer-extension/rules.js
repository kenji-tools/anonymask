// rules.js — Règles d'anonymisation partagées

// Fragments réutilisables pour éviter la duplication
// Prénom : Majuscule + minuscules, avec tiret géré par (-Majuscule+minuscules)*
// On NE met PAS \- dans la classe des minuscules — le tiret est géré séparément
const _CIVILITES = "(Monsieur|Madame|Mademoiselle|Docteur|Maître|Professeur|M\\.|Mme\\.?|Mlle\\.?|Mr\\.?|Mrs\\.?|Ms\\.?|Miss|Dr\\.?|Me\\.?|Pr\\.)";
// Mot normal capitalisé (sans tiret dans les minuscules)
// ex : Dupont, Martin
const _MOT_CAP  = "[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30}";
// Mot capitalisé composé avec tiret : Dupont-Martin, Marie-Claire
const _MOT_COMP = "[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30})*";
// Particules nobiliaires capitalisées
const _PARTICULES = "(De|La|Le|Du|Des|D'|Et|Von|Van|Den)";

const ANONYMIZATION_RULES = [
  {
    id: "civilite_prenom_nom",
    label: "Civilité + Prénom Nom",
    description: "Mme Marie Dupont, Monsieur Jean-Pierre Martin-Leroy…",
    // Civilité + Prénom(-Prénom)? + Nom(-Nom)?
    pattern: /\b(Monsieur|Madame|Mademoiselle|Docteur|Maître|Professeur|M\.|Mme\.?|Mlle\.?|Mr\.?|Mrs\.?|Ms\.?|Miss|Dr\.?|Me\.?|Pr\.?)[ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,20}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,20})*[ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,25}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,25})*([ \t]+(De|La|Le|Du|Des|D'|Et|Von|Van|Den)[ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,25}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,25})*){0,2}\b/g,
    replacement: "[Nom anonymisé]",
    enabled: true
  },
  {
    id: "civilite_prenom_NOM",
    label: "Civilité + Prénom NOM",
    description: "M. Jean DUPONT, Mme Marie-Claire MARTIN-LEROY…",
    // Prénom(-Prénom)? + NOM(-NOM)?
    pattern: /\b(Monsieur|Madame|Mademoiselle|Docteur|Maître|Professeur|M\.|Mme\.?|Mlle\.?|Mr\.?|Mrs\.?|Ms\.?|Miss|Dr\.?|Me\.?|Pr\.?)[ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,20}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,20})*[ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,})*([ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,})*){0,2}\b/g,
    replacement: "[Nom anonymisé]",
    enabled: true
  },
  {
    id: "nom_civilite",
    label: "Civilité + Nom seul",
    description: "Mme Dupont, Madame Martin-Leroy, M. De La Tour…",
    // Nom(-Nom)* + particules éventuelles
    pattern: /\b(Monsieur|Madame|Mademoiselle|Docteur|Maître|Professeur|M\.|Mme\.?|Mlle\.?|Mr\.?|Mrs\.?|Ms\.?|Miss|Dr\.?|Me\.?|Pr\.?)[ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30})*([ \t]+(De|La|Le|Du|Des|D'|Et|Von|Van|Den)[ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30})*){0,3}([ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,30})*)?\b/g,
    replacement: "[Nom anonymisé]",
    enabled: true
  },
  {
    id: "civilite_NOM_majuscules",
    label: "Civilité + NOM (tout en majuscules)",
    description: "Madame DUPONT, Monsieur MARTIN-LEROY, Mr. DE LA TOUR…",
    // NOM(-NOM)* en majuscules — tiret géré séparément, pas dans [A-Z]{2,}
    pattern: /\b(Monsieur|Madame|Mademoiselle|Docteur|Maître|Professeur|M\.|Mme\.?|Mlle\.?|Mr\.?|Mrs\.?|Ms\.?|Miss|Dr\.?|Me\.?|Pr\.?)[ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,})*([ \t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,})*){0,2}\b/g,
    replacement: "[Nom anonymisé]",
    enabled: true
  },
  {
    id: "email",
    label: "Adresses e-mail",
    description: "prenom.nom@domaine.fr",
    pattern: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g,
    replacement: "[Email anonymisé]",
    enabled: true
  },
  {
    id: "telephone_fr",
    label: "Téléphones français",
    description: "06 12 34 56 78, +33 6 12 34 56 78…",
    pattern: /(\+33\s?|0)(6|7|1|2|3|4|5|8|9)(\s?\d{2}){4}\b/g,
    replacement: "[Téléphone anonymisé]",
    enabled: true
  },
  {
    id: "nir",
    label: "Numéro de sécurité sociale (NIR)",
    description: "1 85 12 75 123 456 78",
    pattern: /\b[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b/g,
    replacement: "[NIR anonymisé]",
    enabled: true
  },
  {
    id: "iban",
    label: "IBAN",
    description: "FR76 3000 6000 0112 3456 7890 189",
    // [\s-]? pour les espaces ou tirets entre groupes — tiret en fin de classe pour éviter ambiguïté
    pattern: /\b[A-Z]{2}\d{2}[\s-]?([A-Z0-9]{4}[\s-]?){2,7}[A-Z0-9]{1,4}\b/g,
    replacement: "[IBAN anonymisé]",
    enabled: true
  },
  {
    id: "carte_credit",
    label: "Numéros de carte bancaire",
    description: "4532 1234 5678 9012",
    // [\s-]? — tiret en fin de classe
    pattern: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
    replacement: "[Carte anonymisée]",
    enabled: true
  },
  {
    id: "plaque_immat",
    label: "Plaques d'immatriculation françaises",
    description: "AB-123-CD (nouveau format)",
    pattern: /\b[A-HJ-NP-TV-Z]{2}[\s-]\d{3}[\s-][A-HJ-NP-TV-Z]{2}\b/gi,
    replacement: "[Plaque anonymisée]",
    enabled: true
  },
  {
    id: "date",
    label: "Dates",
    description: "01/01/1985, 15 juin 2003, lundi 12 avril 2021…",
    pattern: /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)?[ \t]*(0?[1-9]|[12]\d|3[01])[ \t]*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)[ \t]*(\d{2}|\d{4})\b|\b(0?[1-9]|[12]\d|3[01])[\/\-\.](0?[1-9]|1[0-2])[\/\-\.](\d{2}|\d{4})\b|\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)[ \t]*(19|20)\d{2}\b/gi,
    replacement: "[Date anonymisée]",
    enabled: true
  },
  {
    id: "adresse_postale",
    label: "Adresses postales",
    description: "12 rue de la Paix, BP 123, Bât. B…",
    pattern: /\b(b[âa]t(iment)?\.?[ \t]+\w+[ \t]+)?(appt?\.?|appartement|esc\.?|escalier)?[ \t]*\d{1,4}([ \t]*(bis|ter|quater))?[,\s]*(rue|avenue|boulevard|bd|av\.?|allée|impasse|chemin|passage|voie|route|rte|place|pl\.?|square|sq\.?|résidence|cité|hameau|lotissement|lieudit|lieu-dit|bp|boîte postale|cs)[ \t]+[^\n,;]{2,60}/gi,
    replacement: "[Adresse anonymisée]",
    enabled: true
  },
  {
    id: "code_postal",
    label: "Codes postaux français",
    description: "75001, 69100… (risque de faux positifs)",
    pattern: /\b(0[1-9]|[1-9]\d)\d{3}\b/g,
    replacement: "[CP anonymisé]",
    enabled: false
  },
  {
    id: "siret",
    label: "SIRET / SIREN",
    description: "SIRET: 14 chiffres, SIREN: 9 chiffres",
    pattern: /\b(\d{3}\s?\d{3}\s?\d{3}\s?\d{5}|\d{3}\s?\d{3}\s?\d{3})\b/g,
    replacement: "[SIRET/SIREN anonymisé]",
    enabled: true
  },
  {
    id: "ip_address",
    label: "Adresses IP",
    description: "192.168.1.1, 10.0.0.1…",
    pattern: /\b((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    replacement: "[IP anonymisée]",
    enabled: true
  }
];

// Règle spéciale chargée dynamiquement depuis prenoms.txt
const PRENOMS_RULE = {
  id: "prenoms_fichier",
  label: "Prénom (fichier) + Nom",
  description: "Depuis prenoms.txt : Sophie MARTIN, Julien Dupont…",
  pattern: null,
  replacement: "[Nom anonymisé]",
  enabled: true,
  fromFile: true
};
ANONYMIZATION_RULES.splice(4, 0, PRENOMS_RULE);
