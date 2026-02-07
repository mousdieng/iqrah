# Quran API - Iqrah

API Spring Boot pour gérer le texte et l'audio du Coran avec possibilité d'ajouter différents récitateurs, traducteurs et traductions, et des options de répétition de versets ou de pages.

## Fonctionnalités

### Lecture et filtrage
- Récupération d'un verset spécifique avec filtres optionnels (récitateur, traducteur, langue)
- Récupération d'une sourate complète
- Récupération d'un Juz (para) complet

### Répétition intelligente
- Répétition d'un verset N fois
- Répétition d'une sourate complète N fois
- Répétition d'un Juz complet N fois
- Répétition par page (à implémenter)

### Gestion des ressources
- Liste de tous les récitateurs disponibles
- Liste de tous les traducteurs disponibles
- Liste de toutes les langues disponibles

### Mémorisation personnelle
- Marquer des versets comme mémorisés
- Suivi de la progression personnelle
- Gestion des favoris

## Endpoints API

### Lecture
```
GET /api/quran/aya/{surah}/{aya}?reciter=&translator=&language=
GET /api/quran/surah/{surah}?reciter=&translator=&language=
GET /api/quran/juz/{juz}?reciter=&translator=&language=
```

### Répétition
```
GET /api/quran/repeat/aya/{surah}/{aya}?count=3&reciter=&pauseDuration=0
GET /api/quran/repeat/surah/{surah}?count=3&reciter=&pauseDuration=0
GET /api/quran/repeat/juz/{juz}?count=3&reciter=&pauseDuration=0
GET /api/quran/repeat/page/{page}?count=3&reciter=&pauseDuration=0
```

### Gestion des ressources
```
GET /api/quran/reciters
GET /api/quran/translators
GET /api/quran/languages
GET /api/quran/translators/{language}
```

### Progression utilisateur
```
POST /api/quran/progress
GET /api/quran/progress/{userId}
GET /api/quran/progress/{userId}/memorized
```

### Favoris
```
POST /api/quran/favorites
DELETE /api/quran/favorites
GET /api/quran/favorites/{userId}
```

## Installation et démarrage

### Prérequis
- Java 17+
- Maven 3.6+

### Démarrage en mode développement
```bash
./mvnw spring-boot:run
```

L'API sera accessible sur `http://localhost:8080`

### Console H2
En mode développement, la console H2 est disponible sur `http://localhost:8080/h2-console`
- URL JDBC: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: `password`

### Configuration pour production
Créer un fichier `application-prod.yml` avec la configuration MySQL et démarrer avec:
```bash
./mvnw spring-boot:run -Dspring.profiles.active=prod
```

## Structure du projet

```
src/
├── main/
│   ├── java/com/iqrah/quran/
│   │   ├── entity/          # Entités JPA
│   │   ├── repository/      # Repositories Spring Data
│   │   ├── service/         # Couche métier
│   │   ├── controller/      # Contrôleurs REST
│   │   ├── dto/            # Objets de transfert de données
│   │   └── config/         # Configuration
│   └── resources/
│       ├── application.yml  # Configuration principale
│       ├── data.sql        # Données de test
│       └── audio/          # Fichiers audio (à ajouter)
```

## Données de test

L'application est livrée avec des données de test incluant:
- Sourate Al-Fatiha complète en arabe
- Traductions en français (Muhammad Hamidullah) et anglais (Sahih International)
- Fichiers audio de référence pour Abdul Basit et Mishary Al-Afasy

## Extensions futures

- Implémentation de la répétition par page
- Ajout de la révision espacée (spaced repetition)
- Interface utilisateur web ou desktop
- Support de fichiers audio locaux
- Statistiques de mémorisation
- API d'import de nouvelles traductions/récitateurs