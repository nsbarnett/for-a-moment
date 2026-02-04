"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { renderRetro } from "@/lib/retro";

type Phase = "warning" | "warningFading" | "terminalFadingIn" | "terminal";

type Node = {
  id: string;
  prompt: string;              // terminal text to type (retro)
  options: { label: string; nextId: string }[]; // user choices (normal text)
};

const NODES: Node[] = [
  {
    id: "start",
    prompt: "hi",
    options: [
      { label: "Hello", nextId: "q1" },
      { label: "Absolutely not", nextId: "end" },
    ],
  },
  {
    id: "q1",
    prompt: "quick question... what did you do today?",
    options: [
      { label: "Worked", nextId: "q2" },
      { label: "Rested", nextId: "q2" },
      { label: "I’m not sure", nextId: "q2" },
    ],
  },
  {
    id: "q2",
    prompt: "do you feel present right now?",
    options: [
      { label: "Yes", nextId: "end" },
      { label: "No", nextId: "end" },
    ],
  },
  {
    id: "end",
    prompt: "i see.",
    options: [{ label: "…", nextId: "start" }],
  },
];

const getNode = (id: string) => NODES.find((n) => n.id === id) ?? NODES[0];

function resizeCanvasToElement(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1)); // ✅ cap for perf

  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return dpr;
}

export function RetroExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<Phase>("warning");

  // terminal behavior
  const [cursorOn, setCursorOn] = useState(true);
  const [typed, setTyped] = useState("");
  const [showUserArea, setShowUserArea] = useState(false);

  // conversation state
  const [nodeId, setNodeId] = useState("start");
  const node = useMemo(() => getNode(nodeId), [nodeId]);

  // user area state
  const [userName] = useState("Me");
  const [userChoice, setUserChoice] = useState<string>("");

  // animation state
  const [isAnimating, setIsAnimating] = useState(false);

  const terminalTextForCanvas = useMemo(() => {
    const cursor = cursorOn ? "▌" : " ";
    return `${typed}${cursor}`;
  }, [typed, cursorOn]);

  const canvasOpts = useMemo(
    () => ({
      text: terminalTextForCanvas,
      fontSize: 64,
      pixelScale: 3,
      rgbOffset: 2,
      maskAlpha: 0.22,
      scanlineAlpha: 0.18,
      flicker: 0.04,
      background: "#0b0b0b",
      fontFamily: `"Fixedsys Excelsior","Fixedsys",monospace`,
    }),
    [terminalTextForCanvas]
  );

  // Ensure Fixedsys is loaded before canvas starts drawing
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await document.fonts.load('16px "Fixedsys Excelsior"');
        await document.fonts.ready;
      } catch {
        // fallback ok
      }
      if (alive) setFontReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!fontReady) return;

    let raf = 0;
    let alive = true;

    const draw = () => {
      if (!alive) return;
      const dpr = resizeCanvasToElement(canvas);
      renderRetro(canvas, dpr, canvasOpts);
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {});
    ro.observe(canvas);

    draw();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasOpts, fontReady]);

  // Cursor blink (once terminal is active)
  useEffect(() => {
    if (phase === "warning" || phase === "warningFading") return;

    const id = window.setInterval(() => setCursorOn((v) => !v), 520);
    return () => window.clearInterval(id);
  }, [phase]);

  // Helpers: typewriter + untypewriter
  const typeTo = async (full: string, speed = 28) => {
    setIsAnimating(true);
    setTyped("");
    for (let i = 1; i <= full.length; i++) {
      await new Promise((r) => setTimeout(r, speed));
      setTyped(full.slice(0, i));
    }
    setIsAnimating(false);
  };

  const untype = async (speed = 18) => {
    setIsAnimating(true);
    let current = typed;
    while (current.length > 0) {
      await new Promise((r) => setTimeout(r, speed));
      current = current.slice(0, -1);
      setTyped(current);
    }
    setIsAnimating(false);
  };

  // When terminal becomes active, type initial prompt after 2s, then reveal user area
  useEffect(() => {
    if (phase !== "terminal") return;

    let alive = true;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 2000));
      if (!alive) return;

      await typeTo(node.prompt, 36);
      if (!alive) return;

      setShowUserArea(true);
    };

    run();

    return () => {
      alive = false;
    };
    // only run when entering terminal, not every node change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Handle clicking an option:
  // 1) save user's choice, 2) untype current terminal prompt, 3) type next prompt
  const onPick = async (label: string, nextId: string) => {
    if (isAnimating) return;

    setUserChoice(label);

    // Keep user area visible + centered
    setShowUserArea(true);

    // Transition terminal content
    await untype(16);

    setNodeId(nextId);

    // Type the next node's prompt (after nodeId updates)
    const nextNode = getNode(nextId);
    await typeTo(nextNode.prompt, 34);
  };

  const onContinue = () => {
    setPhase("warningFading");

    window.setTimeout(() => {
      setPhase("terminalFadingIn");

      window.setTimeout(() => {
        setPhase("terminal");
      }, 520);
    }, 520);
  };

  const showWarning = phase === "warning" || phase === "warningFading";
  const warningFading = phase === "warningFading";
  const terminalVisible = phase !== "warning";
  const terminalFadingIn = phase === "terminalFadingIn";

  return (
    <div className="retroStage">
      <div className={`terminalShell ${terminalVisible ? "isVisible" : ""} ${terminalFadingIn ? "fadeIn" : ""}`}>
        <canvas ref={canvasRef} className="terminalCanvas" />
      </div>

      {showWarning && (
        <div className={`warningOverlay ${warningFading ? "fadeOut" : "fadeIn"}`}>
          <div className="warningBox">
            <div className="warningHeader">WARNING</div>
            <div className="warningBody">
              Viewer discretion is advised. This experience contains themes that may be unsettling.
            </div>
            <button className="warningContinue" onClick={onContinue}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* User response area (centered, normal text) */}
      <div className={`userArea ${showUserArea ? "show" : ""}`}>
        <div className="userName">{userName}</div>
        <div className="userDivider" />
        <div className="userChoice">{userChoice || "Choose a response…"}</div>

        <div className="userOptions">
          {node.options.map((opt) => (
            <button
              key={opt.label}
              className="userOptionBtn"
              onClick={() => onPick(opt.label, opt.nextId)}
              disabled={isAnimating}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
