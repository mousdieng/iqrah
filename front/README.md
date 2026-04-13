# Iqrah - Application de Mémorisation du Coran

Application Angular moderne pour aider à la mémorisation du Saint Coran avec des fonctionnalités avancées de répétition, lecture audio et suivi de progression.

## 🚀 Fonctionnalités

### ✨ Fonctionnalités Principales

- **📖 Lecture du Coran** : Parcourir les 114 sourates avec texte arabe
- **🎧 Lecteur Audio Intégré** : Écouter les récitations avec plusieurs récitateurs célèbres
- **🔄 Système de Répétition Intelligent** :
  - Répétition d'ayahs individuelles
  - Répétition de sourates complètes
  - Répétition par page du Mushaf
  - Répétition par Juz
  - Répétition de plages personnalisées
- **⏸️ Contrôles de Pause** : Pauses configurables entre les répétitions
- **⭐ Favoris** : Marquer vos ayahs préférées
- **📊 Suivi de Progression** :
  - Marquer les ayahs comme mémorisées
  - Système de révision espacée (Spaced Repetition)
  - Statistiques de progression
  - Ayahs à réviser
- **🎨 Interface Moderne** : Design élégant avec TailwindCSS et PrimeNG

### 🎯 Fonctionnalités Avancées

- **🔁 Modes de Répétition** :
  - Nombre de répétitions configurable (1-100)
  - Durée de pause ajustable (0-30 secondes)
  - Choix du récitateur
- **🎵 Player Audio** :
  - Lecture/Pause
  - Navigation (Précédent/Suivant)
  - Contrôle du volume
  - Vitesse de lecture ajustable (0.5x - 2x)
  - Barre de progression
- **📱 Design Responsive** : Fonctionne parfaitement sur mobile, tablette et desktop
- **💾 Sauvegarde Locale** : Toutes les données sauvegardées dans le navigateur

## 🛠️ Technologies Utilisées

- **Angular 19** (Standalone Components)
- **TypeScript**
- **TailwindCSS** - Pour le styling
- **PrimeNG** - Composants UI
- **RxJS** - Gestion d'état réactive
- **LocalStorage** - Sauvegarde des données utilisateur

## 📂 Structure du Projet

```
front/
├── src/
│   ├── app/
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── header/
│   │   │   ├── audio-player/
│   │   │   ├── ayah-card/
│   │   │   └── repeat-controls/
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── home/
│   │   │   ├── surahs/
│   │   │   ├── surah-detail/
│   │   │   └── memorization/
│   │   ├── services/            # Services
│   │   │   ├── quran.service.ts
│   │   │   ├── audio.service.ts
│   │   │   ├── repeat.service.ts
│   │   │   └── storage.service.ts
│   │   ├── models/              # Interfaces TypeScript
│   │   │   └── quran.models.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── styles.css
│   └── index.html
├── tailwind.config.js
└── package.json
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- API Backend en cours d'exécution sur `http://localhost:8080`

### Installation

1. **Installer les dépendances**
```bash
cd front
npm install
```

2. **Lancer le serveur de développement**
```bash
ng serve
# ou
npm start
```

3. **Accéder à l'application**
```
http://localhost:4200
```

### Scripts Disponibles

```bash
# Démarrer le serveur de développement
ng serve

# Build de production
ng build

# Lancer les tests
ng test
```

## 🔌 Configuration API

L'application se connecte à l'API backend sur `http://localhost:8080`. Si votre API est sur un autre port, modifiez les URLs dans :

- `src/app/services/quran.service.ts`
- `src/app/services/audio.service.ts`

```typescript
// Exemple dans quran.service.ts
private apiUrl = 'http://localhost:8080/api/quran';

// Pour changer le port
private apiUrl = 'http://localhost:VOTRE_PORT/api/quran';
```

## 📖 Guide d'Utilisation

### 1. Page d'Accueil
- Visualisez vos statistiques de mémorisation
- Consultez l'ayah du jour
- Accédez rapidement aux différentes sections

### 2. Liste des Sourates
- Parcourez toutes les sourates
- Filtrez par type de révélation (Mecquoise/Médinoise)
- Recherchez par nom ou numéro

### 3. Détail d'une Sourate
- Lisez le texte arabe complet
- Écoutez la récitation de chaque ayah
- Configurez la répétition
- Marquez les ayahs comme mémorisées ou favorites

### 4. Mémorisation
- Consultez vos ayahs mémorisées
- Voyez les ayahs à réviser
- Suivez votre progression globale

### 5. Player Audio
- Contrôlez la lecture en bas de l'écran
- Ajustez le volume et la vitesse
- Naviguez entre les ayahs

## 🎨 Personnalisation

### Couleurs Thématiques

Les couleurs principales sont définies dans `tailwind.config.js` :

```javascript
quranic: {
  gold: '#D4AF37',
  green: '#2D5016',
  darkGreen: '#1a2e0d',
  cream: '#F5F5DC',
}
```

### Polices Arabes

Deux polices sont utilisées pour le texte arabe :
- **Amiri** : Pour les en-têtes et texte général
- **Scheherazade New** : Pour le texte coranique

## 🔄 Système de Répétition

Le système de répétition utilise plusieurs modes :

1. **Mode Ayah** : Répète une seule ayah X fois
2. **Mode Sourate** : Joue toute la sourate X fois
3. **Mode Page** : Joue toutes les ayahs d'une page X fois
4. **Mode Juz** : Joue tout un juz X fois
5. **Mode Plage** : Joue une plage d'ayahs X fois

Chaque mode peut être configuré avec :
- Nombre de répétitions
- Pause entre répétitions
- Choix du récitateur

## 💾 Sauvegarde des Données

Toutes les données sont sauvegardées localement dans le navigateur :

- **Progression** : Ayahs mémorisées, dates de révision, difficulté
- **Favoris** : Ayahs favorites avec tags et notes
- **Paramètres** : Préférences utilisateur

Les données sont stockées dans `localStorage` et peuvent être effacées depuis les paramètres du navigateur.

## 🐛 Résolution de Problèmes

### L'audio ne fonctionne pas
- Vérifiez que l'API backend est démarrée
- Vérifiez l'URL de l'API dans les services
- Assurez-vous que les fichiers audio sont accessibles

### Les sourates ne se chargent pas
- Vérifiez la connexion à l'API
- Ouvrez la console développeur (F12) pour voir les erreurs
- Vérifiez que l'API retourne des données correctes

### Problèmes de styling
- Assurez-vous que TailwindCSS est correctement configuré
- Vérifiez que les imports PrimeNG sont présents dans `styles.css`

## 📝 Prochaines Fonctionnalités

- [ ] Mode hors-ligne avec Service Worker
- [ ] Support multi-langues pour les traductions
- [ ] Notes et annotations personnalisées
- [ ] Partage de progression
- [ ] Rappels de révision
- [ ] Mode nuit
- [ ] Export/Import des données
- [ ] Statistiques avancées et graphiques

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 🙏 Remerciements

- Données du Coran : API Quran
- Récitateurs : Divers récitateurs renommés
- UI Components : PrimeNG
- Icons : PrimeIcons

---

**Développé avec ❤️ pour faciliter la mémorisation du Noble Coran**
