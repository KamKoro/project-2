# Scene It

Scene It is a full-stack movie review platform inspired by Letterboxd and IMDb. Log films, rate them, write reviews, follow friends, and discover what the community is watching.

## Features

### Core
- **Shared film catalog** — One canonical page per film with aggregated community scores
- **TMDB search** — Find films with real posters, synopses, cast, and backdrops (with manual entry fallback)
- **Diary** — Log films with ratings, reviews, and watch dates
- **Watchlist** — Save films to watch later
- **Discover** — Search, filter by genre, sort by rating or popularity

### Social
- **Public profiles** — View any user's diary and stats at `/profiles/:username`
- **Follow users** — Build a network and see activity in your feed
- **Following feed** — Recent reviews from people you follow
- **Latest reviews** — Community activity on the home page
- **Trending** — Most-reviewed and highest-rated films

### Engagement
- **Review likes** — Like other users' reviews
- **Comments** — Reply to community reviews
- **Notifications** — Alerts when someone follows you, likes, or comments on your reviews
- **Rewatch logging** — Log additional viewings with new dates

### Platform
- **10-point ratings** with descriptive labels
- **Light / dark mode**
- **WCAG 2.1 AA** accessibility
- **Session-based auth** with bcrypt

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Runtime | Node.js |
| Backend | Express.js |
| Database | MongoDB with Mongoose |
| External API | [TMDB](https://www.themoviedb.org/documentation/api) (optional) |
| Views | EJS |
| Styling | CSS, Bulmaswatch |

## Prerequisites

- Node.js v22+
- MongoDB (local or Atlas)
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api)) — optional but recommended

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
SESSION_SECRET=your-random-session-secret
TMDB_API_KEY=your-tmdb-api-key
PORT=3000
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | Session cookie secret |
| `TMDB_API_KEY` | TMDB API key for search & posters |
| `PORT` | Server port (default `3000`) |

### 3. Start the server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Sign up** and create an account
2. **Log a film** via TMDB search or manual entry (`Log Film` in navbar)
3. **Discover** films, add to watchlist, and read community reviews
4. **Follow users** from their profile pages
5. Check your **Diary** and **Feed** for personal and social activity

## Routes

| Route | Description |
|-------|-------------|
| `/films` | Discover & search catalog |
| `/directors` | Search directors |
| `/directors/:id` | Director profile & films |
| `/actors` | Search actors |
| `/actors/:id` | Actor profile & films |
| `/films/log` | Log a new film (TMDB or manual) |
| `/films/:id` | Film detail, reviews, watchlist |
| `/diary` | Your watched films |
| `/watchlist` | Films to watch |
| `/feed` | Following activity |
| `/notifications` | Your activity alerts |
| `/profiles/:username` | Public user profile |

## Project Structure

```
project-2/
├── controllers/     # films, users, social, auth
├── models/          # Film, Review, Watchlist, Comment, User
├── utilities/       # TMDB, film helpers, community queries
├── views/           # EJS templates
└── server.js
```

## Accessibility

Scene It targets WCAG 2.1 Level AA: skip links, keyboard navigation, focus indicators, color contrast, semantic HTML, and reduced-motion support.

## Deploy to Heroku

Scene It runs on Heroku with MongoDB Atlas. Heroku requires a paid Eco dyno (~$5/month); there is no free tier.

### 1. Prepare MongoDB Atlas

In [MongoDB Atlas](https://cloud.mongodb.com), open your cluster → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`). This lets Heroku connect to your database.

### 2. Create the Heroku app

```bash
heroku login
heroku create your-app-name
```

Or create the app in the [Heroku Dashboard](https://dashboard.heroku.com) and connect this GitHub repo under the **Deploy** tab.

### 3. Set config vars

```bash
heroku config:set MONGODB_URI="your-atlas-connection-string"
heroku config:set SESSION_SECRET="a-long-random-secret"
heroku config:set NODE_ENV=production
heroku config:set TMDB_API_KEY="your-tmdb-api-key"
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Session cookie secret (use a strong random value) |
| `NODE_ENV` | Set to `production` for secure cookies |
| `TMDB_API_KEY` | TMDB API key (optional) |

Heroku sets `PORT` automatically — do not add it.

### 4. Deploy

```bash
git push heroku main
```

Or use **Deploy Branch** in the Heroku Dashboard if GitHub is connected.

### 5. Open the live app

```bash
heroku open
```

Your app will be available at `https://your-app-name.herokuapp.com`.

## License

ISC
