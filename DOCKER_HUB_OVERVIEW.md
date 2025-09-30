# OpenClassBoard - Interactive Classroom Display

OpenClassBoard is a dynamic, interactive classroom display application built with React. Create a customizable digital classroom board with draggable and resizable widgets including clocks, polls, dice, timers, scoreboards, and more.

## 📦 Available Tags

- **`latest`** - Full version with polling functionality (requires Firebase)
- **`nopoll`** - Lightweight version without polling (no Firebase required)

## 🚀 Quick Start

### Option 1: Full Version with Polling (latest)

Requires Firebase configuration for polling features:

```bash
docker run -d \
  -p 5173:5173 \
  -e VITE_FIREBASE_API_KEY=your_api_key \
  -e VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com \
  -e VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com \
  -e VITE_FIREBASE_PROJECT_ID=your_project_id \
  -e VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app \
  -e VITE_FIREBASE_MESSAGING_SENDER_ID=123456789 \
  -e VITE_FIREBASE_APP_ID=1:123456789:web:abcdef \
  -e VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ \
  bacon8t0r/openclassboard:latest
```

### Option 2: No-Poll Version (nopoll)

Simplified version without polling features, no Firebase setup needed:

```bash
docker run -d \
  -p 5173:5173 \
  bacon8t0r/openclassboard:nopoll
```

Then open http://localhost:5173 in your browser.

### Using Docker Compose

#### Full Version (docker-compose.yml)
```yaml
version: '3.8'

services:
  openclassboard:
    image: bacon8t0r/openclassboard:latest
    container_name: openclassboard
    ports:
      - "5173:5173"
    environment:
      # Firebase Configuration
      VITE_FIREBASE_API_KEY: "your_api_key_here"
      VITE_FIREBASE_AUTH_DOMAIN: "your_project.firebaseapp.com"
      VITE_FIREBASE_DATABASE_URL: "https://your_project-default-rtdb.firebaseio.com"
      VITE_FIREBASE_PROJECT_ID: "your_project_id"
      VITE_FIREBASE_STORAGE_BUCKET: "your_project.firebasestorage.app"
      VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789"
      VITE_FIREBASE_APP_ID: "1:123456789:web:abcdef"
      VITE_FIREBASE_MEASUREMENT_ID: "G-ABCDEFGHIJ"
    restart: unless-stopped
```

#### No-Poll Version (docker-compose.nopoll.yml)
```yaml
version: '3.8'

services:
  openclassboard:
    image: bacon8t0r/openclassboard:nopoll
    container_name: openclassboard-nopoll
    ports:
      - "5173:5173"
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
# OR for nopoll version:
docker-compose -f docker-compose.nopoll.yml up -d
```

## 🔥 Firebase Setup

OpenClassBoard uses Firebase Realtime Database for the interactive polling feature. Follow these steps to configure Firebase:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Give your project a name (e.g., "OpenClassBoard")
4. Follow the setup wizard

### 2. Enable Realtime Database

1. In your Firebase project, navigate to **Build → Realtime Database**
2. Click **Create Database**
3. Choose a location closest to your users
4. Start in **Test mode** (for development) or configure security rules for production

### 3. Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the configuration values

### 4. Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain | `my-project.firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_URL` | Realtime Database URL | `https://my-project-default-rtdb.firebaseio.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID | `my-project-12345` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `my-project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID for cloud messaging | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID | `1:123456789012:web:abc123def456` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID (optional) | `G-ABCDEFGHIJ` |

**Note:** All variables are **required** except `VITE_FIREBASE_MEASUREMENT_ID` which is optional.

### 5. Security Rules (Production)

For production, update your Realtime Database rules:

```json
{
  "rules": {
    "polls": {
      "$pollId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**⚠️ Important:** These rules allow anyone to read/write polls. For production, consider implementing authentication and more restrictive rules.

## ✨ Features

### Core Features (All Versions)
- **🎛️ Customizable Widgets**: Clock, Timer, Dice, Name Picker, Stoplight, Scoreboard, Text Editor, Image Display, Unit Converter
- **🏆 Scoreboard**: Track team scores with customizable colors and names
- **📝 Rich Text Editor**: Create formatted text with lists and styling
- **⚙️ Widget Appearance**: Adjust transparency and hide titles
- **💾 Layout Management**: Save and load different classroom layouts
- **🎨 Customizable Styling**: Personalize widget colors and backgrounds
- **📱 Responsive Design**: Works on tablets, laptops, and interactive whiteboards

### Additional Features (`:latest` tag only)
- **📊 Interactive Polls**: Real-time voting with QR code support (requires Firebase)

## 🛠️ Usage

### Adding Widgets

1. Click on any widget button in the bottom toolbar
2. Widgets appear on screen and can be dragged and repositioned
3. Resize widgets by dragging the corner handle
4. Click the X button to remove widgets

### Managing Layouts

1. Click the ⚙️ settings button (top-right)
2. Adjust widget transparency with the slider
3. Toggle "Hide Widget Titles" for a cleaner look
4. Save layouts with custom names for different lessons
5. Load saved layouts instantly

### Using Polls

1. Add a Poll widget
2. Click the 🟢 GO LIVE button to activate
3. Share the voting URL or QR code with students
4. Watch votes update in real-time
5. Reset or modify options as needed

### Scoreboard

1. Add a Scoreboard widget
2. Click ⚙️ to add/remove teams
3. Customize team names and colors
4. Use +1/-1 buttons to adjust scores
5. Reset all scores with the 🔄 button

## 🔒 Security

This Docker image includes the latest security patches:
- Updated npm to fix CVE-2024-21538 (cross-spawn vulnerability)
- Updated Alpine packages to address BusyBox CVEs
- Based on Node.js 22 Alpine for minimal attack surface

## 📦 Volumes

OpenClassBoard stores all data in browser localStorage. No volumes are required.

## 🌐 Networking

- **Port 5173**: Main application port (Vite development server)
- Access the application at `http://localhost:5173` or `http://your-server-ip:5173`

## 🔄 Updates

Pull the latest version:
```bash
# For full version
docker pull bacon8t0r/openclassboard:latest

# For nopoll version
docker pull bacon8t0r/openclassboard:nopoll

# Then restart
docker-compose down
docker-compose up -d
```

## 💡 Tips

- **Choosing a Version**: Use `:nopoll` tag if you don't need polling features or want to avoid Firebase setup
- **Mobile Access**: Use your computer's IP address to access from tablets/phones on the same network
- **Persistent Storage**: Layouts are saved in browser localStorage, so use the same browser to maintain your setups
- **Performance**: For best performance, use a modern browser (Chrome, Firefox, Edge)

## 🐛 Troubleshooting

### Polls Not Working
- Verify all Firebase environment variables are set correctly
- Check Firebase Realtime Database is enabled
- Ensure database rules allow read/write access

### Can't Access from Other Devices
- Make sure port 5173 is accessible on your network
- Check firewall settings
- Use the correct IP address (not localhost) from other devices

### Widgets Not Saving
- Check browser localStorage is enabled
- Clear browser cache if layouts appear corrupted
- Use the same browser to maintain saved layouts

## 📄 License

MIT License - Free to use for educational purposes

## 🤝 Contributing

Visit the [GitHub repository](https://github.com/Bacon8tor/OpenClassBoard) to contribute or report issues.

## ☕ Support

If you find OpenClassBoard useful, consider supporting the developer:
[Buy Me A Coffee](https://www.buymeacoffee.com/bacon8tor)

---

**Made with ❤️ for educators everywhere**