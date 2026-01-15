"use client";

import dynamic from "next/dynamic";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState } from "react";

const DraggableTerminal = dynamic(() => import("@/components/DraggableTerminal"), {
  ssr: false,
});

interface TerminalPosition {
  x: number;
  y: number;
}

function DropContainer() {
  const [terminalPosition, setTerminalPosition] = useState<TerminalPosition>({ x: 100, y: 100 });

  const [, drop] = useDrop(() => ({
    accept: "TERMINAL",
    drop: (item: any, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        setTerminalPosition((prev) => ({
          x: Math.max(0, prev.x + delta.x),
          y: Math.max(0, prev.y + delta.y),
        }));
      }
      return undefined;
    },
  }));

  return (
    <div ref={drop} style={{ minHeight: "calc(100vh - 100px)", position: "relative" }}>
      <DraggableTerminal position={terminalPosition} onPositionChange={setTerminalPosition} />
    </div>
  );
}

export default function Home() {
  return (
    <DndProvider backend={HTML5Backend}>
      <main style={{ padding: "2rem", minHeight: "100vh", backgroundColor: "#1e1e1e" }}>
        <h1 style={{ color: "white", marginBottom: "2rem" }}>Draggable Terminal Demo</h1>
        <DropContainer />
      </main>
    </DndProvider>
  );
}

