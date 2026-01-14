"use client";

import { useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

const ItemType = "TERMINAL";

interface DraggableTerminalProps {
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
}

export default function DraggableTerminal({ position, onPositionChange }: DraggableTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingManual, setIsDraggingManual] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 14,
    bgColor: "#1e1e1e",
    textColor: "#d4d4d4",
  });

  const gradients = [
    { name: "Dark", value: "#1e1e1e" },
    { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Forest", value: "linear-gradient(135deg, #4fd1c5 0%, #63b3ed 100%)" },
    { name: "Peachy", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "Galaxy", value: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
    { name: "Candy", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { name: "Berry", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fbc2eb 100%)" },
  ];

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Don't auto-connect drag - we'll handle it manually
  useEffect(() => {
    if (dragHandleRef.current) {
      drag(dragHandleRef);
    }
  }, [drag]);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: settings.fontSize,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "transparent",
        foreground: settings.textColor,
      },
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    
    // Apply background to xterm elements
    const viewport = terminalRef.current.querySelector('.xterm-viewport');
    const screen = terminalRef.current.querySelector('.xterm-screen');
    if (viewport) (viewport as HTMLElement).style.background = 'transparent';
    if (screen) (screen as HTMLElement).style.background = 'transparent';
    
    // Delay fit to ensure DOM is fully rendered
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn("Failed to fit terminal:", e);
      }
    }, 0);

    terminal.writeln("Welcome to Draggable Terminal!");
    terminal.writeln("This terminal uses xterm.js and react-dnd");
    terminal.writeln("Drag anywhere to move, resize from bottom-right corner");
    terminal.writeln("");
    terminal.write("$ ");

    let currentLine = "";
    terminal.onData((data) => {
      if (data === "\r") {
        terminal.write("\r\n");
        if (currentLine.trim()) {
          terminal.writeln(`You entered: ${currentLine}`);
        }
        currentLine = "";
        terminal.write("$ ");
      } else if (data === "\x7F") {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          terminal.write("\b \b");
        }
      } else {
        currentLine += data;
        terminal.write(data);
      }
    });

    xtermRef.current = terminal;

    return () => {
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [settings]);

  // Handle resize
  useEffect(() => {
    if (fitAddonRef.current && !isResizing) {
      setTimeout(() => {
        try {
          fitAddonRef.current?.fit();
        } catch (e) {
          console.warn("Failed to fit terminal:", e);
        }
      }, 0);
    }
  }, [size, isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setSize({
        width: Math.max(400, startWidth + deltaX),
        height: Math.max(300, startHeight + deltaY),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleClearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.write("$ ");
    }
    handleCloseContextMenu();
  };

  const handleCopyText = () => {
    if (xtermRef.current) {
      const selection = xtermRef.current.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    }
    handleCloseContextMenu();
  };

  const handlePasteText = async () => {
    if (xtermRef.current) {
      try {
        const text = await navigator.clipboard.readText();
        xtermRef.current.write(text);
      } catch (err) {
        console.warn("Failed to paste:", err);
      }
    }
    handleCloseContextMenu();
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
    handleCloseContextMenu();
  };

  const getReadableTextColor = (bg: string): string => {
    if (bg.includes("gradient")) {
      // For gradients, return a color that works well with most
      return "#ffffff";
    }
    // Simple contrast check for solid colors
    const hex = bg.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => handleCloseContextMenu();
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [contextMenu]);

  return (
    <>
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          border: "2px solid #555",
          borderRadius: 8,
          opacity: isDragging ? 0.5 : 1,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          ref={dragHandleRef}
          style={{
            height: 8,
            backgroundColor: "#3d3d3d",
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        />
        <div
          ref={terminalRef}
          style={{
            padding: 10,
            height: "calc(100% - 8px)",
            position: "relative",
            background: settings.bgColor,
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
          }}
        />
        <div
          data-resize-handle
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            cursor: "nwse-resize",
            backgroundColor: "#555",
            borderBottomRightRadius: 6,
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          }}
        />
      </div>
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: "#2d2d2d",
            border: "1px solid #555",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            minWidth: 150,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={handleCopyText}
            style={{
              padding: "8px 12px",
              color: "#d4d4d4",
              cursor: "pointer",
              fontSize: 14,
              borderBottom: "1px solid #444",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Copy
          </div>
          <div
            onClick={handlePasteText}
            style={{
              padding: "8px 12px",
              color: "#d4d4d4",
              cursor: "pointer",
              fontSize: 14,
              borderBottom: "1px solid #444",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Paste
          </div>
          <div
            onClick={handleClearTerminal}
            style={{
              padding: "8px 12px",
              color: "#d4d4d4",
              cursor: "pointer",
              fontSize: 14,
              borderBottom: "1px solid #444",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Clear Terminal
          </div>
          <div
            onClick={handleOpenSettings}
            style={{
              padding: "8px 12px",
              color: "#d4d4d4",
              cursor: "pointer",
              fontSize: 14,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Settings
          </div>
        </div>
      )}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            style={{
              backgroundColor: "#2d2d2d",
              border: "2px solid #555",
              borderRadius: 12,
              padding: "24px",
              minWidth: 400,
              maxWidth: 500,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#fff", marginTop: 0, marginBottom: 20 }}>Terminal Settings</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#d4d4d4", display: "block", marginBottom: 8, fontSize: 14 }}>
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#d4d4d4", display: "block", marginBottom: 8, fontSize: 14 }}>
                Background
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {gradients.map((gradient) => (
                  <div
                    key={gradient.name}
                    onClick={() => {
                      setSettings({
                        ...settings,
                        bgColor: gradient.value,
                        textColor: getReadableTextColor(gradient.value),
                      });
                    }}
                    style={{
                      background: gradient.value,
                      height: 50,
                      borderRadius: 8,
                      cursor: "pointer",
                      border: settings.bgColor === gradient.value ? "3px solid #fff" : "2px solid #555",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#fff",
                      fontWeight: "bold",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {gradient.name}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#d4d4d4", display: "block", marginBottom: 8, fontSize: 14 }}>
                Text Color
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["#ffffff", "#d4d4d4", "#a0a0a0", "#ff6b9d", "#c780fa", "#4fd1c5", "#fbbf24", "#000000"].map((color) => (
                  <div
                    key={color}
                    onClick={() => setSettings({ ...settings, textColor: color })}
                    style={{
                      backgroundColor: color,
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      cursor: "pointer",
                      border: settings.textColor === color ? "3px solid #fff" : "2px solid #555",
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#667eea",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5568d3")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#667eea")}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
