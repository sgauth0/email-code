# Draggable Terminal with Next.js

A Next.js application featuring a draggable terminal component built with xterm.js and react-dnd.


## Plus a framework for an email client this is all just basic ass framework stuff for other things feel free to use it for whatever MIT type stuuff.

## Features

- 🖥️ Full-featured terminal emulation using [xterm.js](https://xtermjs.org/)
- 🎯 Drag-and-drop functionality with [react-dnd](https://react-dnd.github.io/react-dnd/)
- ⚡ Built with Next.js 15 and TypeScript
- 🎨 Modern UI with custom styling

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
termtest/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page with DnD provider
│   │   └── globals.css     # Global styles
│   └── components/
│       └── DraggableTerminal.tsx  # Main terminal component
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **xterm.js** - Terminal emulation
- **react-dnd** - Drag and drop functionality
- **@xterm/addon-fit** - Terminal size fitting

## How It Works

The terminal component:
1. Initializes xterm.js in a React component
2. Uses react-dnd's `useDrag` hook for drag functionality
3. Handles user input and displays output
4. Dynamically imported to avoid SSR issues with browser APIs

## License

MIT
