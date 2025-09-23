# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 5173 with host 0.0.0.0)
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Project Architecture

OpenClassBoard is a React-based interactive classroom display application with a widget-based architecture.

### Core Structure

- **App.jsx**: Main application with SimpleRouter component handling `/vote/{pollId}` routes and main classroom screen
- **Main Screen Components**:
  - `OpenClassScreen`: Core classroom interface with draggable widgets, background customization, and layout persistence
  - `BottomBar`: Widget creation toolbar at bottom of screen
  - `VotingPage`: Separate voting interface for poll participation

### Widget System

All widgets follow a consistent pattern:
- Located in `src/components/widgets/`
- Wrapped with `WidgetWrapper` component for consistent UI (title editing, remove button, glass styling)
- Use `useDraggable` hook for drag/resize functionality
- Support position persistence and widget-specific data storage
- Available widgets: Stoplight, Clock, Timer, Poll, Dice, NamePicker, Conversion, Image

Widget creation flow:
1. Add widget type to `addWidget()` function in App.jsx with default dimensions
2. Add case to widget render switch statement
3. Widget receives common props: `onRemove`, `onRename`, `position`, `registerRef`, `glassButtonStyle`, `theme`, `customStyle`, `widgetData`

### Data Persistence

- **Local Storage**:
  - Current layout: `openClassBoard` key
  - Named layouts: `namedScreens` key
  - Auto-saves every 1000ms when widgets change
- **Firebase**: Real-time poll voting data (configured via environment variables)

### Custom Hooks

- **useDraggable**: Handles widget dragging, resizing, and position management
- **useWidgetDimensions**: Manages widget size constraints and responsive behavior

### Styling Approach

- Glass morphism design with `glassButtonStyle` object
- Backdrop blur effects throughout UI
- Customizable background colors/images
- Theme support (currently "glass" theme implemented)

### Firebase Integration

- Realtime Database for poll voting
- Environment variables required (see .env.example)
- Poll data structure: polls/{pollId} with title, options, votes, voters
- Graceful degradation when Firebase not configured

### Router Implementation

Simple custom router (not React Router):
- `/vote/{pollId}` → VotingPage component
- All other paths → Main classroom screen
- Uses native popstate events and window.location.pathname