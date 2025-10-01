# OpenClassBoard

OpenClassBoard is a dynamic, interactive classroom display application built with React. It allows teachers to create a customizable digital classroom board with draggable and resizable widgets such as clocks, polls, dice, timers, and more. The app is designed to make teaching more interactive and engaging for students.

## ✨ Features

### Core Widgets
* **🎛️ Customizable Widgets**: Add, remove, rename, drag, and resize widgets on the classroom board
* **📊 Interactive Polls**: Students can vote in real-time with QR code voting support (requires Firebase)
* **🏆 Scoreboard Widget**: Track team scores with customizable team names and colors
* **📝 Text Editor Widget**: Rich text editing with formatting, lists, and styling options
* **🎲 Dice Widget**: Roll customizable dice with variable sides and quantities
* **⏰ Clock & Timer Widgets**: Display time with customizable colors and multiple timer functions
* **📐 Unit Conversion**: Convert between measurements, including liquids and powders
* **🖼️ Image Widget**: Display images from URLs or file uploads
* **🚦 Stoplight Widget**: Visual traffic light for classroom management
* **👥 Name Picker**: Randomly select student names for participation

### Customization & Layout
* **⚙️ Widget Appearance**: Adjust widget transparency and hide titles for a cleaner look
* **🎨 Customizable Styling**: Personalize widget colors, backgrounds, and themes
* **💾 Named Layouts**: Save and load different classroom layouts for various lessons
* **🖼️ Custom Backgrounds**: Set solid colors or upload custom background images
* **📱 Responsive Design**: Works on tablets, laptops, and interactive whiteboards

### Advanced Features
* **🔥 Firebase Integration**: Real-time polling with cloud database and secure rules
* **🔒 Vote Protection**: localStorage prevents users from voting multiple times (even after refresh)
* **📱 QR Code Voting**: Students can scan QR codes to access polls on their devices
* **🔄 Real-time Sync**: Poll results update live across all connected devices
* **🧹 Auto Cleanup**: Old polls are automatically cleaned up after 24 hours

## 🚀 Quick Start with Docker

### Available Docker Tags

- **`bacon8t0r/openclassboard:latest`** - Full version with polling functionality (requires Firebase)
- **`bacon8t0r/openclassboard:nopoll`** - Lightweight version without polling (no Firebase required)

### Option 1: Full Version with Polling

Requires Firebase configuration:

```bash
docker run -d -p 5173:5173 \
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

Then open http://localhost:5173

### Option 2: No-Poll Version (Simplest)

No Firebase setup needed:

```bash
docker run -d -p 5173:5173 bacon8t0r/openclassboard:nopoll
```

Then open http://localhost:5173

### Option 3: Using Docker Compose

**Full Version (docker-compose.yml)**
```yaml
version: '3.8'

services:
  openclassboard:
    image: bacon8t0r/openclassboard:latest
    container_name: openclassboard
    ports:
      - "5173:5173"
    environment:
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

**No-Poll Version**
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
```

## 🔥 Firebase Setup (For Polling Features)

To use the polling features with the `:latest` tag, you'll need a Firebase project:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Give your project a name (e.g., "OpenClassBoard")
4. Follow the setup wizard

### 2. Enable Realtime Database
1. Navigate to **Build → Realtime Database**
2. Click **Create Database**
3. Choose a location closest to your users
4. Start in **Test mode** for development

### 3. Get Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the configuration values

### 4. Apply Security Rules
For production deployment, see [FIREBASE_SECURITY.md](FIREBASE_SECURITY.md) for secure database rules that:
- Validate poll data structure
- Prevent vote tampering
- Add rate limiting
- Include 24-hour poll expiration

### 5. Deploy
Use the configuration values as environment variables in Docker or `.env` file for local development.

**Note:** If you don't need polling features, use the `bacon8t0r/openclassboard:nopoll` tag instead!

## 💻 Local Development

### Prerequisites
* Node.js (v18+ recommended)
* npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Bacon8tor/OpenClassBoard.git
   cd OpenClassBoard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

## 🎯 Usage

### Basic Operations
1. **Add Widgets**: Click widget buttons in the bottom toolbar
2. **Move Widgets**: Drag widgets by clicking and holding the title bar
3. **Resize Widgets**: Drag the bottom-right corner of any widget
4. **Rename Widgets**: Click the widget title to edit its name
5. **Remove Widgets**: Click the ✕ button in the top-right of any widget

### Settings Panel (⚙️ button)
- **Background**: Set solid colors or upload custom images
- **Widget Transparency**: Adjust opacity of all widgets
- **Hide Titles**: Toggle widget titles for a cleaner look
- **Save Layouts**: Name and save different classroom setups
- **Load Layouts**: Quickly switch between saved layouts
- **Reset**: Clear all widgets and settings

### Using Polls (`:latest` tag only)
1. Add a Poll widget
2. Customize poll title and options
3. Click **🟢 GO LIVE** to activate
4. Share the voting URL or display the QR code
5. Students vote on their devices
6. Watch results update in real-time
7. Use **🔄 Reset** to clear votes for a new poll

### Using Scoreboard
1. Add a Scoreboard widget
2. Click the ⚙️ button to add/remove teams
3. Customize team names and colors
4. Use +1/-1 buttons to adjust scores
5. Reset all scores with the 🔄 button

### Tips
- All layouts are saved to browser localStorage
- Use the same browser to maintain your saved setups
- For mobile access, use your computer's IP address (not localhost)

## 🐳 Building Your Own Docker Images

### Build Full Version
```bash
# Build the image
docker build -t openclassboard:latest .

# Run with your .env file
docker run -d -p 5173:5173 --env-file .env openclassboard:latest
```

### Build No-Poll Version
```bash
# Build using the nopoll Dockerfile
docker build -f Dockerfile.nopoll -t openclassboard:nopoll .

# Or use the build script
chmod +x build-nopoll.sh
./build-nopoll.sh

# Run (no environment variables needed)
docker run -d -p 5173:5173 openclassboard:nopoll
```

See [BUILD_NOPOLL.md](BUILD_NOPOLL.md) for detailed information about the no-poll version.

## 🤝 Contributing

Contributions are welcome! Whether you want to add new widgets, improve existing features, or fix bugs:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-widget`)
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 💖 Support

If you find OpenClassBoard useful, consider:

[![Buy Me A Coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=☕&slug=bacon8tor&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff)](https://www.buymeacoffee.com/bacon8tor)

## 🛠️ Built With

* [React](https://reactjs.org/) - Frontend framework (v19)
* [Vite](https://vitejs.dev/) - Build tool (v7)
* [Firebase](https://firebase.google.com/) - Real-time database (optional)
* [Docker](https://www.docker.com/) - Containerization (Node 22 Alpine)

## 📚 Documentation

- [DOCKER_HUB_OVERVIEW.md](DOCKER_HUB_OVERVIEW.md) - Complete Docker deployment guide
- [FIREBASE_SECURITY.md](FIREBASE_SECURITY.md) - Firebase security rules and best practices
- [BUILD_NOPOLL.md](BUILD_NOPOLL.md) - Building the no-poll version
- [CLAUDE.md](CLAUDE.md) - Project architecture for AI assistants

## 🔒 Security

- Updated npm to fix CVE-2024-21538 (cross-spawn vulnerability)
- Updated Alpine packages to address BusyBox CVEs
- Firebase security rules with data validation and voter protection
- localStorage-based vote tracking prevents refresh-based re-voting
- Secure production deployment on Amazon Amplify

## 🌐 Live Demo

Visit [openclassboard.com](https://openclassboard.com) to see it in action!

---

**Made with ❤️ for educators everywhere**