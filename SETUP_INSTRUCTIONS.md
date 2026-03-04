# Setup Instructions - FromPromptToFE

## 🔒 Security Note
The actual configuration files (`.env`, `appsettings.json`) are **NOT** included in this repository as they contain sensitive credentials. You need to create them from the provided templates.

---

## 📋 Prerequisites
- **Node.js**: v20.19+ or v22.12+
- **.NET SDK**: 8.0+
- **PostgreSQL** database (or Supabase account)
- **GitHub OAuth App** (for GitHub sign-in)
- **Google OAuth Client** (for Google sign-in)
- **Gemini API Key** (for AI features)

---

## 🚀 Setup Instructions

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd FromPromptToFE
```

### 2. Backend Setup (BE/FromFromptToFE)

#### 2.1. Create `appsettings.json`
```bash
cd BE/FromFromptToFE
cp appsettings.example.json appsettings.json
```

#### 2.2. Edit `appsettings.json` with your credentials:
- **ConnectionStrings.ConnectionString**: Your PostgreSQL connection string
- **Jwt.SecretKey**: Generate a strong secret key (min 32 characters)
- **EmailSettings**: Your email SMTP credentials (Gmail App Password)
- **GitHub.ClientId** & **ClientSecret**: From GitHub OAuth App
- **Gemini.ApiKey**: From Google AI Studio

#### 2.3. Run Database Migration
Execute the SQL script to add GitHub OAuth support:
```bash
# Connect to your database and run:
psql -h [host] -U [user] -d [database] -f Data/add_github_id_to_users.sql
# Or run manually via Supabase Dashboard SQL Editor
```

#### 2.4. Start Backend
```bash
dotnet restore
dotnet run
# Backend runs on http://localhost:5274
```

---

### 3. Frontend Setup (FE/FromPromptToFE)

#### 3.1. Create `.env`
```bash
cd FE/FromPromptToFE
cp .env.example .env
```

#### 3.2. Edit `.env` with your credentials:
- **VITE_GITHUB_CLIENT_ID**: Your GitHub OAuth App Client ID
- **VITE_GEMINI_API_KEY**: Your Gemini API Key

#### 3.3. Install Dependencies & Start
```bash
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 How to Get API Keys & Credentials

### GitHub OAuth App
1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Set **Authorization callback URL** to: `http://localhost:5173/auth/github/callback`
4. Copy **Client ID** and **Client Secret**
5. Update both `appsettings.json` (backend) and `.env` (frontend)

### Google OAuth Client
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized origins and redirect URIs
4. Follow frontend setup instructions

### Gemini API Key
1. Go to: https://aistudio.google.com/apikey
2. Create API key
3. Add to `.env` as `VITE_GEMINI_API_KEY`

### Email (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use this app password in `appsettings.json` → `EmailSettings.Password`

---

## 📦 What's Committed to Git

✅ **Included** (safe to commit):
- Source code (.cs, .tsx, .ts)
- Configuration templates (.example files)
- SQL migration scripts
- Documentation

❌ **Excluded** (secrets - never commit):
- `.env` (contains API keys)
- `appsettings.json` (contains passwords, secrets)
- `node_modules/`, `bin/`, `obj/` (build artifacts)

---

## 🛠️ Common Issues

### Port Already in Use
- Frontend (5173): Kill existing process or change port in `vite.config.ts`
- Backend (5274): Kill existing process or change port in `appsettings.json`

### Database Connection Failed
- Verify PostgreSQL is running
- Check connection string in `appsettings.json`
- Ensure database exists and user has permissions

### GitHub OAuth Error "Redirect URI Mismatch"
- Ensure callback URL in GitHub OAuth App matches exactly: `http://localhost:5173/auth/github/callback`
- Update both frontend `.env` and backend `appsettings.json`

---

## 📝 Production Deployment

For production, update:
- Frontend: Create `.env.production` with production URLs
- Backend: Create `appsettings.Production.json` with production credentials
- GitHub OAuth: Add production callback URL to GitHub OAuth App
- Database: Run migrations on production database

---

## 👥 Team Collaboration

When team members clone the repo:
1. They create their own `.env` and `appsettings.json` from templates
2. They configure with their own API keys (or use shared dev keys via secure channel - NOT git)
3. They run database migrations
4. They start backend & frontend

**Never commit actual secrets to git!**
