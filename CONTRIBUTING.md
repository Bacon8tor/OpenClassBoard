# Contributing to OpenClassBoard

Thanks for taking the time to contribute! Whether it's a bug fix, new widget, or documentation improvement — all contributions are welcome.

## Getting Started

1. **Fork** the repository and clone your fork
2. **Install dependencies**: `npm install`
3. **Copy** `.env.example` to `.env` and fill in your Firebase credentials
4. **Start the dev server**: `npm run dev`

## How to Contribute

### Reporting Bugs
Open a [GitHub Issue](https://github.com/Bacon8tor/OpenClassBoard/issues) using the **Bug Report** template. Include:
- What you did, what you expected, what happened
- Browser and OS
- Screenshots if applicable

### Suggesting Features
Open a [GitHub Issue](https://github.com/Bacon8tor/OpenClassBoard/issues) using the **Feature Request** template.

### Submitting a Pull Request
1. Create a branch: `git checkout -b feature/my-feature` or `fix/my-fix`
2. Make your changes
3. Run the linter: `npm run lint`
4. Run a production build to confirm nothing is broken: `npm run build`
5. Push your branch and open a Pull Request against `main`

## Adding a New Widget

Widgets live in `src/components/widgets/`. To add one:

1. Create `src/components/widgets/MyWidget.jsx`
2. Use `useDraggable` for drag/resize and `useWidgetDimensions` for responsive sizing
3. Wrap the content in `<WidgetWrapper>` for consistent chrome (title bar, remove button)
4. Register the widget in `src/App.jsx`:
   - Add a default size entry in `addWidget()`
   - Add a `case "mywidget":` to the render switch
5. Add the button in `src/components/BottomBar.jsx` widget list

## Code Style

- Run `npm run lint` before submitting — PRs with lint errors will not be merged
- Follow the existing patterns in the codebase (hooks, component structure, styling)
- Keep components focused — if a component exceeds ~300 lines, consider splitting it

## Questions

Open a [Discussion](https://github.com/Bacon8tor/OpenClassBoard/discussions) or join the [Discord](https://discord.gg/KDfRFZ9YFe).
