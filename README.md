# 🏆 SenegalFC League

**Plateforme de gestion pour la Ligue Sénégalaise EA Sports FC**

Une solution **complète et automatisée** pour organiser une ligue de Pro Clubs avec synchronisation automatique des résultats EA Sports.

---

## ✨ **Fonctionnalités**

### 👑 **Gestion Centralisée (Organisateurs)**
- ✅ Ajout/Gestion des clubs participants
- ✅ Configuration des EA Club IDs
- ✅ Synchronisation automatique EA Sports
- ✅ Validation des matchs détectés
- ✅ Calcul automatique du classement
- ✅ Publication d'annonces officielles

### 🌍 **Interface Publique**
- ✅ Classement en temps réel
- ✅ Historique des matchs
- ✅ Statistiques de la ligue
- ✅ Design responsive (mobile-friendly)

### 🔄 **Auto-Synchronisation**
- ✅ Récupération automatique des résultats EA
- ✅ Détection des matchs inter-clubs
- ✅ Mise à jour automatique des stats
- ✅ Notifications de nouveaux matchs

---

## 🛠️ **Stack Technique**

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: PostgreSQL
- **EA API**: eafc-clubs-api (communautaire)
- **UI**: Lucide React Icons

---

## 🚀 **Installation Express**

### **1. Cloner le Projet**
```bash
git clone <votre-repo>
cd senegalfc-league
```

### **2. Installer les Dépendances**
```bash
npm install
```

### **3. Configuration Base de Données**

Copier et configurer l'environnement :
```bash
cp .env.example .env
```

Éditer `.env` avec votre base PostgreSQL :
```env
DATABASE_URL="postgresql://username:password@localhost:5432/senegalfc_league"
ADMIN_PASSWORD="votre-mot-de-passe-admin"
```

### **4. Initialiser la Base**
```bash
# Générer le client Prisma + Appliquer le schéma
npx prisma generate
npx prisma db push

# Setup avec données de test
node scripts/setup.js
```

### **5. Lancer l'Application**
```bash
npm run dev
```

### **6. Accès**
- **Public**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

---

## 👑 **Guide Admin - Workflow Type**

### **Setup Initial** (Une fois)

1. **Ajouter les clubs** participants avec leur EA Club ID
   ```
   Admin → Gestion des Clubs → Ajouter un Club
   - Nom: "HOF 221"
   - EA Club ID: "40142" 
   - Plateforme: "PS5"
   ```

2. **Première synchronisation**
   ```
   Admin → Dashboard → "Sync Manuel"
   → Le système scanne tous les clubs EA
   → Détecte automatiquement les matchs inter-clubs
   ```

### **Fonctionnement Quotidien**

1. **Matin** : Sync manuelle ou attendre la sync auto
2. **Validation** : Valider les nouveaux matchs détectés
3. **Classement** : Mis à jour automatiquement
4. **Annonces** : Publier les résultats du jour

### **Actions Admin Disponibles**

```
📋 Gestion des Clubs
├── Ajouter/Modifier clubs
├── Activer/Désactiver
└── Configuration EA Club IDs

⚽ Gestion des Matchs  
├── Valider les matchs détectés
├── Corriger un résultat manuellement
├── Rejeter un faux-positif
└── Voir l'historique complet

🔄 Synchronisation
├── Sync manuelle immédiate
├── Config sync automatique
├── Logs de synchronisation
└── Gestion des erreurs

📊 Classement
├── Recalculer les statistiques
├── Ajustements de points (bonus/malus)
└── Export des données

📢 Communication
├── Créer des annonces
├── Messages importants
└── Résultats officiels
```

---

## 🎯 **Comment ça Marche**

### **Détection Automatique des Matchs**

1. Le système récupère les 10 derniers matchs de chaque club via l'API EA
2. Il compare les adversaires entre les clubs de la ligue
3. Si "Club A" a joué contre "Club B" (tous deux dans la ligue) → Match détecté !
4. Le match est ajouté en base avec `validated: false`
5. L'admin valide ou rejette le match
6. Si validé → Classement mis à jour automatiquement

### **Calcul du Classement**

```javascript
// Système de points configurable
Victoire = 3 points
Match nul = 1 point  
Défaite = 0 point

// Classement par ordre de priorité:
1. Points totaux
2. Différence de buts (en cas d'égalité)
3. Buts marqués
```

### **Exemple de Flow Complet**

```
🎮 Clubs jouent sur EA Sports FC
         ↓
🔄 Sync auto récupère les résultats (toutes les 2h)
         ↓  
🎯 Système détecte: "HOF 221 vs Dakar FC"
         ↓
⏳ Match en attente de validation admin
         ↓
✅ Admin valide le match
         ↓
📊 Classement mis à jour automatiquement
         ↓
🌍 Visible sur la page publique immédiatement
```

---

## 📁 **Structure du Projet**

```
senegalfc-league/
├── app/
│   ├── page.tsx              # Page publique (classement)
│   ├── admin/                # Dashboard admin
│   │   ├── page.tsx          # Vue d'ensemble admin
│   │   ├── clubs/           # Gestion des clubs
│   │   ├── matches/         # Gestion des matchs
│   │   └── announcements/   # Annonces
│   └── api/
│       ├── public/          # APIs publiques (classement, matchs)
│       └── admin/           # APIs admin (sync, validation)
├── lib/
│   ├── prisma.ts           # Client base de données
│   ├── ea-sports.ts        # Client API EA Sports
│   ├── ranking.ts          # Calculs classement
│   └── types.ts            # Types TypeScript
├── prisma/
│   └── schema.prisma       # Schéma base de données
└── scripts/
    └── setup.js           # Script d'initialisation
```

---

## 🗄️ **Base de Données**

### **Modèles Principaux**

```typescript
LeagueClub {
  name: "HOF 221"
  eaClubId: "40142"
  platform: "ps5"
  points: 9      // Calculé auto
  wins: 3        // Calculé auto  
  draws: 0       // Calculé auto
  losses: 1      // Calculé auto
}

LeagueMatch {
  homeClubId: "club1"
  awayClubId: "club2" 
  homeScore: 3
  awayScore: 1
  validated: true    // Validé par admin
  playedAt: "2025-12-24T20:00:00Z"
}

Announcement {
  title: "Résultats Journée 5"
  content: "HOF 221 domine..."
  type: "results"    // info, results, important, warning
  published: true
}
```

---

## ⚙️ **Configuration Avancée**

### **Sync Automatique**

Modifier `prisma/schema.prisma` → `LeagueConfig` :
```typescript
syncInterval: 7200  // 2 heures (en secondes)
autoSync: true      // Activer/désactiver
```

### **Règles de Points**

```typescript
pointsWin: 3    // Points pour une victoire
pointsDraw: 1   // Points pour un match nul  
pointsLoss: 0   // Points pour une défaite
```

### **Plateformes Supportées**

```typescript
Platform: "ps5" | "xbox" | "pc"
```

---

## 🚀 **Déploiement Production**

### **Variables d'Environnement**

```env
# Production
DATABASE_URL="postgresql://prod_user:pass@host:5432/senegalfc_prod"
NEXTAUTH_SECRET="super-secret-production-key"
NEXTAUTH_URL="https://votre-domaine.com"

# Admin  
ADMIN_PASSWORD="mot-de-passe-securise"

# Optional
NEXT_PUBLIC_GOOGLE_ANALYTICS="GA-XXXXX"
```

### **Plateformes Recommandées**

- **Vercel** (Frontend + API) - Gratuit
- **Supabase** (PostgreSQL) - Gratuit jusqu'à 500MB
- **PlanetScale** (MySQL alternative) - Gratuit
- **Railway** (Full-stack) - €5/mois

### **Setup Vercel Express**

```bash
# 1. Push sur GitHub
git add .
git commit -m "feat: SenegalFC League ready"
git push origin main

# 2. Importer sur Vercel.com
# 3. Configurer variables d'environnement
# 4. Deploy automatique !
```

---

## 📊 **Monitoring & Maintenance**

### **Logs Important à Surveiller**

```bash
# Synchronisation
🔄 Auto-sync EA activée (toutes les 2h)
✅ 3 nouveau(x) match(s) ajouté(s)
❌ Erreur récupération Club ABC: timeout

# Base de données  
📊 Classement recalculé: 8 clubs mis à jour
⚖️ Ajustement de points: HOF 221 +2 points (bonus fair-play)

# API EA Sports
🎯 Match inter-clubs détecté: HOF 221 vs Dakar FC
⚠️ Club non trouvé: ID 99999
```

### **Maintenance Régulière**

- ✅ Vérifier les logs de sync quotidiennement
- ✅ Valider les matchs détectés rapidement  
- ✅ Backup base de données hebdomadaire
- ✅ Surveiller l'espace disque (logs)

---

## 🐛 **Dépannage**

### **Problèmes Courants**

**❌ "Database connection failed"**
```bash
# Vérifier DATABASE_URL dans .env
npx prisma studio  # Test de connexion
```

**❌ "Club non trouvé sur EA"**
```bash
# EA Club ID incorrect ou club inactif
# → Vérifier l'ID dans EA Sports FC
# → Mettre le club en "inactive" temporairement
```

**❌ "Sync timeout"**  
```bash
# API EA Sports temporairement indisponible
# → Réessayer plus tard
# → Vérifier la connectivité réseau
```

**❌ "Match déjà en base"**
```bash
# Normal - évite les doublons
# Si vraiment un doublon → nettoyer manuellement en base
```

### **Reset Complet**

```bash
# Reset base de données + restart
npx prisma migrate reset
node scripts/setup.js
npm run dev
```

---

## 🤝 **Contribution**

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'feat: ajoute nouvelle fonctionnalite'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

---

## 📝 **Licence**

MIT License - Libre d'utilisation

---

## 🎉 **Roadmap Future**

- [ ] 📱 App mobile (React Native)
- [ ] 🔔 Notifications Discord/Telegram
- [ ] 📈 Graphiques de performance
- [ ] 🏆 Système de trophées  
- [ ] 📊 Analytics avancées
- [ ] 🎮 Integration multiple ligues
- [ ] 🤖 Bot Discord intégré
- [ ] 📸 Screenshots automatiques

---

## 📞 **Support**

- 🐛 Issues: GitHub Issues
- 💬 Discord: [Votre serveur]  
- 📧 Email: [votre-email]

---

**Made with ⚽ for the Senegalese esport community**

🇸🇳 **Ligue Sénégalaise EA Sports FC • 2025**