# TODO - Nettoyage des secrets pour GitHub

- [x] 1. Supprimer `src/structures/proxys.json` (9 tokens en dur)
- [x] 2. Mettre à jour `.gitignore` (ajouter proxys.json et *.log)
- [x] 3. Chiffrer le mot de passe dans `utils/db/1472041317184966839.json`
- [x] 4. Modifier `setpassword.js` pour chiffrer les futurs mots de passe
- [x] 5. Nettoyer le cache git (`git rm --cached`)
- [x] 6. Vérifier qu'il ne reste plus de tokens en dur

