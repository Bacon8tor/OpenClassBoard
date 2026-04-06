# OpenClassBoard

An interactive classroom display board built with React. Teachers can add, drag, and resize widgets — polls, timers, dice, scoreboards, and more — to create an engaging live classroom screen.

🌐 **Live demo:** [openclassboard.com](https://openclassboard.com)

---

## Widgets

| Widget | Description |
|--------|-------------|
| 🚦 **Stoplight** | Visual red/yellow/green traffic light for classroom management |
| ⏰ **Clock** | Live clock with customizable colors |
| ⏱️ **Timer** | Countdown timer with start/pause/reset |
| 📊 **Poll** | Live voting with QR code — students vote on their own devices *(requires Firebase)* |
| 🎲 **Dice** | Roll any number of dice with configurable sides |
| 👥 **Name Picker** | Randomly select a student name from a list |
| 📐 **Conversion** | Convert cooking measurements (cups, grams, oz, etc.) |
| 🖼️ **Image** | Display an image from a URL or file upload |
| 📝 **Text** | Rich text editor with bold, italic, lists, and headings |
| 🏆 **Scoreboard** | Team score tracker with custom team names and colors |

**All widgets** can be dragged, resized, renamed, and removed. Layouts are saved automatically to browser localStorage.

---

## Running with Docker

The app runs on **port 3000**. Firebase credentials are passed as environment variables at container start — nothing is baked into the image.

### Full version (with Poll widget)

Requires a Firebase project. See [Firebase Setup](#firebase-setup) below.

```bash
docker run -d -p 3000:3000 \
  -e VITE_FIREBASE_API_KEY=your_api_key \
  -e VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com \
  -e VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com \
  -e VITE_FIREBASE_PROJECT_ID=your_project_id \
  -e VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app \
  -e VITE_FIREBASE_MESSAGING_SENDER_ID=123456789 \
  -e VITE_FIREBASE_APP_ID=1:123456789:web:abcdef \
  bacon8t0r/openclassboard:latest
```

Open [http://localhost:3000](http://localhost:3000)

### No-poll version (no Firebase needed)

```bash
docker run -d -p 3000:3000 bacon8t0r/openclassboard:nopoll
```

Open [http://localhost:3000](http://localhost:3000)

### Docker Compose — full version

```yaml
services:
  openclassboard:
    image: bacon8t0r/openclassboard:latest
    container_name: openclassboard
    ports:
      - "3000:3000"
    environment:
      - VITE_FIREBASE_API_KEY=your_api_key
      - VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
      - VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
      - VITE_FIREBASE_PROJECT_ID=your_project_id
      - VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
      - VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
      - VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
      - VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
    restart: unless-stopped
```

### Docker Compose — no-poll version

```yaml
services:
  openclassboard:
    image: bacon8t0r/openclassboard:nopoll
    container_name: openclassboard
    ports:
      - "3000:3000"
    restart: unless-stopped
```

---

## Firebase Setup

The Poll widget requires a free Firebase project for real-time voting.

### 1. Create a project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the wizard

### 2. Enable Realtime Database
1. In your project, go to **Build → Realtime Database**
2. Click **Create Database**
3. Choose a region close to your users
4. Start in **Test mode** (you'll apply proper rules next)

### 3. Apply security rules
Copy the contents of [`firebase-database-rules.json`](firebase-database-rules.json) and paste them into your database rules tab. These rules:
- Allow anyone to read and vote on live polls
- Prevent vote counts from being reduced
- Lock voter records once submitted
- Block writes to any path other than `polls/`

### 4. Get your credentials
1. Go to **Project Settings** → **Your apps** → click the web icon (`</>`)
2. Register the app and copy the config values
3. Use those values as the environment variables shown above

---

## Local Development

**Requirements:** Node.js 18+

```bash
git clone https://github.com/Bacon8tor/OpenClassBoard.git
cd OpenClassBoard
npm install
cp .env.example .env   # fill in your Firebase credentials
npm run dev            # runs on http://localhost:5173
```

### Build your own Docker images

```bash
# Full version
docker build -t openclassboard:latest .

# No-poll version
docker build --build-arg VITE_DISABLE_POLL=true -t openclassboard:nopoll .
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to report bugs, request features, and submit pull requests.

## Security

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities and an explanation of the security model.

## License

MIT — see [LICENSE](LICENSE)

---

## Support

If you find OpenClassBoard useful, consider supporting development:

[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=☕&slug=bacon8tor&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/bacon8tor)

[![Discord](https://img.shields.io/badge/Discord-Join_Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/KDfRFZ9YFe)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?style=for-the-badge&logo=github)](https://github.com/Bacon8tor/OpenClassBoard)
[![Docker Hub](https://img.shields.io/badge/DockerHub-View_Image-blue?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/bacon8t0r/openclassboard)

---

*Made with ❤️ for educators everywhere*
