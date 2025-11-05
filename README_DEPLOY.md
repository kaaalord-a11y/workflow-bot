Deploying the Telegram bot (24/7)

Prerequisites
- Telegram bot token in env var BOT_TOKEN
- Git repository connected to hosting (Render, Railway, Fly.io, or a VPS)

Option A: Render (free tier ok)
1) Create new Web Service → Select this repo
2) Environment: Node
3) Start command: node bot.js
4) Add Environment Variable: BOT_TOKEN = <your token>
5) Deploy

Option B: Railway (one-click)
1) railway init (or use dashboard to import repo)
2) Add variable BOT_TOKEN
3) Deploy

Option C: Docker anywhere
1) Build: docker build -t workflow-bot .
2) Run: docker run -e BOT_TOKEN=your_token --name workflow-bot --restart always -d workflow-bot

Option D: Heroku-like (Procfile)
1) Use Procfile (worker: node bot.js)
2) Set BOT_TOKEN config var
3) Scale worker dyno to 1

Notes
- The bot uses long polling; no webhook setup required
- Ensure only one instance runs at a time per token

