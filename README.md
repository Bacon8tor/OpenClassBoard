# OpenClassBoard

OpenClassBoard is a dynamic, interactive classroom display application built with React. It allows teachers to create a customizable digital classroom board with draggable and resizable widgets such as clocks, polls, dice, and unit converters. The app is designed to make teaching more interactive and engaging for students.

## Features

* **Customizable Widgets**: Add, remove, rename, drag, and resize widgets on the classroom board.
* **Interactive Polls**: Students can vote in real-time, with the ability to edit, add, or delete poll options.
* **Dice Widget**: Roll customizable dice with variable sides and quantities.
* **Unit Conversion**: Quickly convert between measurements, including liquids and powders.
* **Responsive Layout**: Drag-and-drop interface with resizable widgets for flexible classroom displays.
* **Named Saves**: Save and load different classroom layouts for various lessons or activities.
* **Glass-Effect UI**: Modern and sleek interface with visual effects.
* **Optional QR Voting**: Enable QR codes for polls so students can vote on their own devices.

## Screenshots

*Add screenshots here to showcase the interface and widgets.*

## Installation

### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn
* Optional: Docker if you want to run in a container

### Local Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/OpenClassBoard.git
cd OpenClassBoard
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm start
# or
yarn start
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

### Docker Setup

```bash
docker build -t openclassboard:latest .
docker run -p 5173:5173 openclassboard:latest
```



## Usage

1. **Add Widgets**: Use the bottom widget bar to add new widgets to the classroom screen.
2. **Drag & Resize**: Click and drag widgets around. Resize using the handles on the edges.
3. **Edit Widgets**: Rename widgets or update poll options directly from the widget interface.
4. **Save Layout**: Save your current classroom layout for later use.
5. **Load Layout**: Load a previously saved classroom layout.

## Contributing

Contributions are welcome! If you want to add new widgets, improve existing ones, or enhance functionality:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project uses the following libraries and tools:

* React
* React-DOM
* Vite
* @vitejs/plugin-react
* TailwindCSS (if used)
* ESLint
* @eslint/js
* eslint-plugin-react-hooks
* eslint-plugin-react-refresh
* @types/react
* @types/react-dom
* globals

