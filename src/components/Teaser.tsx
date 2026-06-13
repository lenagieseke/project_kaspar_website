// Physics teaser — Canvas 2D + Matter.js rigid-body simulation.
// Must be a client component: it references window, canvas, and Matter.js,
// none of which exist on the server.
'use client';

import { useEffect, useRef } from 'react';

type PieceType = 'word' | 'phrase' | 'fragment' | 'long';

interface TextData {
  lines: string[];
  font: string;
  lh: number;
  bw: number;
}

export default function Teaser({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let currentCleanup: (() => void) | null = null;
    let resizeTimer: ReturnType<typeof setTimeout>;

    function start(canvas: HTMLCanvasElement) {
      let animationId = 0;
      // `stopped` is checked inside the async import callback and before starting
      // the animation loop. React StrictMode calls useEffect twice in development
      // (mount → unmount → mount), so without this flag the cleanup from the first
      // run could fire after the second run has already started.
      let stopped = false;
      let stopPhysics: (() => void) | null = null;

      // Set canvas buffer to physical pixels; all drawing stays in CSS pixels
      // via ctx.scale(dpr, dpr). Physics bodies are also in CSS pixel space.
      const ctx = canvas.getContext('2d')!;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      // Dynamic import keeps Matter.js out of the server bundle entirely.
      // The module is ~170 KB and only needed client-side, so there's no reason
      // to ship it to SSR.
      import('matter-js').then((Matter) => {
        if (stopped) return;

        const { Engine, Bodies, Composite, Runner, Mouse, MouseConstraint } = Matter;

        const engine = Engine.create({ gravity: { y: 1.2 } });
        const WALL = 100;

        Composite.add(engine.world, [
          Bodies.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, { isStatic: true }),
          Bodies.rectangle(-WALL / 2, H / 2, WALL, H * 3, { isStatic: true }),
          Bodies.rectangle(W + WALL / 2, H / 2, WALL, H * 3, { isStatic: true }),
        ]);

        const runner = Runner.create();
        Runner.run(runner, engine);
        stopPhysics = () => {
          Runner.stop(runner);
          Engine.clear(engine);
        };

        // mouse.pixelRatio corrects Matter.js's auto-detected scale, which would
        // otherwise multiply coordinates by dpr, misaligning pointer events with
        // physics bodies on retina / high-DPR screens (including all phones).
        const mouse = Mouse.create(canvas);
        (mouse as unknown as { pixelRatio: number }).pixelRatio = dpr;

        const mc = MouseConstraint.create(engine, {
          mouse,
          constraint: { stiffness: 0.2 },
        });
        Composite.add(engine.world, mc);

        // Remove listeners that Matter.js adds and call preventDefault, blocking
        // native scroll. touchstart must also be passive — if it calls preventDefault
        // the browser cancels the entire touch sequence before touchmove even fires.
        const m = mouse as unknown as {
          mousewheel: EventListener;
          mousemove: EventListener;
          mousedown: EventListener;
        };
        mouse.element.removeEventListener('mousewheel', m.mousewheel);
        mouse.element.removeEventListener('DOMMouseScroll', m.mousewheel);
        mouse.element.removeEventListener('touchstart', m.mousedown);
        mouse.element.addEventListener('touchstart', m.mousedown, { passive: true });
        mouse.element.removeEventListener('touchmove', m.mousemove);
        mouse.element.addEventListener('touchmove', m.mousemove, { passive: true });

        const words = text.split(/\s+/).filter((w) => w.length > 0);

        function randomPiece(): { text: string; type: PieceType } {
          const r = Math.random();
          if (r < 0.2) {
            return { text: words[Math.floor(Math.random() * words.length)], type: 'word' };
          }
          if (r < 0.55) {
            const i = Math.floor(Math.random() * Math.max(0, words.length - 5));
            return { text: words.slice(i, i + 2 + Math.floor(Math.random() * 3)).join(' '), type: 'phrase' };
          }
          if (r < 0.8) {
            const i = Math.floor(Math.random() * Math.max(0, words.length - 10));
            return { text: words.slice(i, i + 5 + Math.floor(Math.random() * 5)).join(' '), type: 'fragment' };
          }
          const i = Math.floor(Math.random() * Math.max(0, words.length - 21));
          return { text: words.slice(i, i + 10 + Math.floor(Math.random() * 11)).join(' '), type: 'long' };
        }

        function randomFontSize(type: PieceType): number {
          switch (type) {
            case 'word':     return Math.floor(W * (0.025 + Math.random() * 0.05));   // ~2.5–7.5vw
            case 'phrase':   return Math.floor(W * (0.02  + Math.random() * 0.015));  // ~2.0–3.5vw
            case 'fragment': return Math.floor(W * (0.015 + Math.random() * 0.01));   // ~1.5–2.5vw
            case 'long':     return Math.floor(W * (0.01  + Math.random() * 0.005));  // ~1.0–1.5vw
          }
        }

        function randomMaxWidth(type: PieceType): number | null {
          switch (type) {
            case 'word':     return null;
            case 'phrase':   return Math.floor(W * (0.1 + Math.random() * 0.1));
            case 'fragment': return Math.floor(W * (0.15 + Math.random() * 0.1));
            case 'long':     return Math.floor(W * (0.2  + Math.random() * 0.2));
          }
        }

        function wrapText(text: string, maxWidth: number): string[] {
          const tokens = text.split(' ');
          const lines: string[] = [];
          let current = '';
          for (const token of tokens) {
            const test = current ? `${current} ${token}` : token;
            if (ctx.measureText(test).width > maxWidth && current) {
              lines.push(current);
              current = token;
            } else {
              current = test;
            }
          }
          if (current) lines.push(current);
          return lines;
        }

        const MAX_BODIES = 200;

        function spawnPiece() {
          const dynamic = Composite.allBodies(engine.world).filter((b) => !b.isStatic);
          if (dynamic.length >= MAX_BODIES) Composite.remove(engine.world, dynamic[0]);

          const piece = randomPiece();
          const size = randomFontSize(piece.type);
          const font = `${size}px "Libre Caslon Display", serif`;
          const lh = size * 1.1;

          ctx.save();
          ctx.font = font;
          const mw = randomMaxWidth(piece.type);
          const lines = mw ? wrapText(piece.text, mw) : [piece.text];
          const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 4;
          ctx.restore();

          const bh = lines.length * lh + 2;
          const x = WALL + Math.random() * (W - WALL * 2);
          const y = -bh / 2 - 5;

          const body = Bodies.rectangle(x, y, bw, bh, {
            restitution: 0.1,
            friction: 0.7,
            frictionAir: 0.01,
            density: 0.003,
            angle: (Math.random() - 0.5) * 0.3,
          });
          (body as Matter.Body & { textData: TextData }).textData = { lines, font, lh, bw };
          Composite.add(engine.world, body);
        }

        const SPAWN_INTERVAL = 700;
        let lastSpawn = -SPAWN_INTERVAL;

        function draw(timestamp: number) {
          animationId = requestAnimationFrame(draw);
          ctx.clearRect(0, 0, W, H);

          if (timestamp - lastSpawn >= SPAWN_INTERVAL) {
            spawnPiece();
            lastSpawn = timestamp;
          }

          ctx.fillStyle = 'black';
          ctx.textBaseline = 'middle';

          for (const body of Composite.allBodies(engine.world)) {
            const b = body as Matter.Body & { textData?: TextData };
            if (body.isStatic || !b.textData) continue;
            const { lines, font, lh, bw } = b.textData;

            ctx.save();
            ctx.translate(body.position.x, body.position.y);
            ctx.rotate(body.angle);
            ctx.font = font;

            const startY = -((lines.length - 1) * lh) / 2;
            if (lines.length === 1) {
              ctx.textAlign = 'center';
              ctx.fillText(lines[0], 0, startY);
            } else {
              ctx.textAlign = 'left';
              const le = -bw / 2 + 2;
              for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], le, startY + i * lh);
              }
            }
            ctx.restore();
          }
        }

        document.fonts.ready.then(() => {
          if (!stopped) animationId = requestAnimationFrame(draw);
        });
      });

      return () => {
        stopped = true;
        if (animationId) cancelAnimationFrame(animationId);
        stopPhysics?.();
      };
    }

    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        currentCleanup?.();
        currentCleanup = start(cvs);
      }, 150);
    }

    window.addEventListener('resize', handleResize);
    currentCleanup = start(canvas);

    return () => {
      currentCleanup?.();
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [text]);

  return (
    <div id="teaser">
      <canvas ref={canvasRef} id="teaser-canvas" />
    </div>
  );
}
