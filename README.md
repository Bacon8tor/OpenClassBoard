# OpenClassBoard

OpenClassBoard is a dynamic, interactive classroom display application built with React. It allows teachers to create a customizable digital classroom board with draggable and resizable widgets such as clocks, polls, dice, timers, and more. The app is designed to make teaching more interactive and engaging for students.

## ✨ Features

* **🎛️ Customizable Widgets**: Add, remove, rename, drag, and resize widgets on the classroom board
* **📊 Interactive Polls**: Students can vote in real-time with QR code voting support
* **🎲 Dice Widget**: Roll customizable dice with variable sides and quantities
* **⏰ Clock & Timer Widgets**: Display time with customizable colors and multiple timer functions
* **📐 Unit Conversion**: Convert between measurements, including liquids and powders
* **🖼️ Image Widget**: Display images from URLs or file uploads
* **🚦 Stoplight Widget**: Visual traffic light for classroom management
* **👥 Name Picker**: Randomly select student names for participation
* **🎨 Customizable Styling**: Personalize widget colors and themes
* **💾 Named Saves**: Save and load different classroom layouts for various lessons
* **📱 Responsive Design**: Works on tablets, laptops, and interactive whiteboards
* **🔥 Firebase Integration**: Real-time polling with cloud database

## 🚀 Quick Start with Docker

### Option 1: Using Docker Hub (Recommended)

```bash
# Run with environment variables
docker run -p 5173:5173 \
  -e VITE_FIREBASE_API_KEY=your_api_key \
  -e VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com \
  -e VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com \
  -e VITE_FIREBASE_PROJECT_ID=your_project_id \
  -e VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app \
  -e VITE_FIREBASE_MESSAGING_SENDER_ID=123456789 \
  -e VITE_FIREBASE_APP_ID=1:123456789:web:abcdef \
  -e VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ \
  bacon8tor/openclassboard:latest
```

### Option 2: Using Docker Compose

1. Download the compose file:
   ```bash
   curl -o docker-compose.yml https://raw.githubusercontent.com/Bacon8tor/OpenClassBoard/main/docker-compose.hub.yml
   ```

2. Edit the environment variables in `docker-compose.yml` with your Firebase credentials

3. Run:
   ```bash
   docker-compose up
   ```

## 🔧 Firebase Setup

To use the polling features, you'll need a Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Realtime Database
4. Get your configuration from Project Settings → General → Your apps
5. Use those values in the environment variables above

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

1. **Add Widgets**: Use the bottom toolbar to add widgets to your classroom board
2. **Customize**: Click the 🎨 button on widgets to customize colors and settings
3. **Arrange**: Drag widgets around and resize them as needed
4. **Save Layouts**: Use the settings panel to save your current layout
5. **Load Layouts**: Quickly switch between different saved classroom setups
6. **Interactive Polls**: Create polls and share the voting link with students

## 🐳 Building Your Own Docker Image

```bash
# Build the image
docker build -t openclassboard:latest .

# Run with your .env file
docker run -p 5173:5173 --env-file .env openclassboard:latest
```

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

* [React](https://reactjs.org/) - Frontend framework
* [Vite](https://vitejs.dev/) - Build tool
* [Firebase](https://firebase.google.com/) - Real-time database
* [Docker](https://www.docker.com/) - Containerization

---

**Made with ❤️ for educators everywhere**