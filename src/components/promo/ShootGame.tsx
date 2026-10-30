"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { REWARD_BY_MAKES, rewardCode, useReward } from "@/store/reward";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/cn";

const SHOTS = 3;
const OPEN_AFTER_MS = 3500;

// Court geometry, in viewBox units (300 × 300).
const START = { x: 150, y: 258 };
const BALL_R = 20;
const RIM = { x: 150, y: 116, rx: 33, ry: 5.5 };
const GRAVITY = 0.36;
const POWER = 0.13;
const MAX_PULL = 92;

type Phase = "aim" | "flying" | "between" | "done";
interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Passed through the hoop on this shot. */
  in: boolean;
}

/** The ball looks smaller the further it travels "into" the court. */
const depth = (y: number) => 0.5 + 0.5 * Math.min(1, Math.max(0, (y - 60) / (START.y - 60)));

function step(b: Ball): Ball {
  const next = { ...b, x: b.x + b.vx, y: b.y + b.vy, vy: b.vy + GRAVITY };
  // Crossing the rim plane on the way down: through the hoop, off the rim, or past it.
  if (!b.in && b.vy > 0 && b.y < RIM.y && next.y >= RIM.y) {
    const r = BALL_R * depth(RIM.y);
    const off = Math.abs(next.x - RIM.x);
    if (off < RIM.rx - r * 0.55) {
      next.in = true;
      next.vx *= 0.3;
      next.vy *= 0.55;
    } else if (off < RIM.rx + r) {
      next.vy = -next.vy * 0.45;
      next.vx += Math.sign(next.x - RIM.x || 1) * 1.6;
      next.y = RIM.y - 1;
    }
  }
  return next;
}

export function ShootGame() {
  const mounted = useMounted();
  const seen = useReward((s) => s.seen);
  const markSeen = useReward((s) => s.markSeen);
  const [open, setOpen] = useState(false);
  // The "Play & win" button waits until the visitor scrolls, so it never covers the hero.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mounted || seen) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      markSeen();
    }, OPEN_AFTER_MS);
    return () => window.clearTimeout(t);
  }, [mounted, seen, markSeen]);

  return (
    <>
      {mounted && seen && !open && scrolled && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-40 flex animate-[pop-in_300ms_var(--ease-out-quint)] items-center gap-2 rounded-pill bg-ink p-2 text-xs sm:pr-4 font-medium text-paper shadow-panel transition-transform hover:-translate-y-0.5"
        >
          <BallIcon className="size-6" />
          <span className="max-sm:sr-only">Play &amp; win</span>
        </button>
      )}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[6px] data-[state=open]:animate-[fade-in_300ms_ease-out]" />
          <Dialog.Content
            // Focus the card itself, not the close button, so no focus ring shows on open.
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLElement).focus();
            }}
            className="fixed top-1/2 left-1/2 z-[120] max-h-[calc(100dvh-1rem)] w-[min(440px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[20px] bg-[#eef0f3] px-6 pt-6 pb-8 text-center shadow-[0_30px_80px_-20px_rgb(0_0_0/0.45)] outline-none data-[state=open]:animate-[pop-in_360ms_var(--ease-out-quint)]">
            <Dialog.Close
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-pill text-ink-soft hover:bg-black/5 hover:text-ink"
              aria-label="Close game"
            >
              <X className="size-4" strokeWidth={1.5} />
            </Dialog.Close>
            {open && <Game />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function Game() {
  const win = useReward((s) => s.win);
  const svgRef = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<Phase>("aim");
  const [shot, setShot] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [ball, setBall] = useState<Ball>({ ...START, vx: 0, vy: 0, in: false });
  const [pull, setPull] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const makes = results.filter(Boolean).length;
  const discount = REWARD_BY_MAKES[makes] ?? 0;

  // Flight: advance the ball each frame until it lands or leaves the court.
  useEffect(() => {
    if (phase !== "flying") return;
    let raf = 0;
    let b = ball;
    const tick = () => {
      b = step(b);
      setBall(b);
      if (b.y > 330 || b.x < -40 || b.x > 340) {
        const next = [...results, b.in];
        setResults(next);
        if (next.length >= SHOTS) {
          win(REWARD_BY_MAKES[next.filter(Boolean).length] ?? 0);
          setPhase("done");
        } else {
          setPhase("between");
          window.setTimeout(() => {
            setShot((s) => s + 1);
            setBall({ ...START, vx: 0, vy: 0, in: false });
            setPhase("aim");
          }, 700);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // The flight starts from the ball as it was at launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const toSvg = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 300, y: ((e.clientY - r.top) / r.height) * 300 };
  };
  const pullVector = (p: { x: number; y: number }) => {
    let dx = START.x - p.x;
    let dy = START.y - p.y;
    const len = Math.hypot(dx, dy);
    if (len > MAX_PULL) {
      dx = (dx / len) * MAX_PULL;
      dy = (dy / len) * MAX_PULL;
    }
    return { dx, dy };
  };

  const launch = (dx: number, dy: number) => {
    setPull(null);
    if (Math.hypot(dx, dy) < 12) {
      setBall({ ...START, vx: 0, vy: 0, in: false });
      return;
    }
    setBall({ ...START, vx: dx * POWER, vy: dy * POWER, in: false });
    setPhase("flying");
  };

  // Keyboard play: a straight shot with a little random drift, at a fixed power.
  const keyShot = () => {
    if (phase !== "aim") return;
    launch((Math.random() - 0.5) * 10, -MAX_PULL * 0.96);
  };

  const aimed = pull ? pullVector(pull) : null;
  const preview: { x: number; y: number }[] = [];
  if (aimed && Math.hypot(aimed.dx, aimed.dy) > 12) {
    let b: Ball = { ...START, vx: aimed.dx * POWER, vy: aimed.dy * POWER, in: false };
    for (let i = 0; i < 46; i++) {
      b = step(b);
      if (i % 3 === 0) preview.push({ x: b.x, y: b.y });
    }
  }
  const shown = aimed && phase === "aim" ? { x: START.x - aimed.dx * 0.25, y: START.y - aimed.dy * 0.25 } : ball;
  const scale = depth(shown.y);
  const inFront = phase === "aim" || ball.vy < 0 || ball.y > RIM.y + 30;

  if (phase === "done") {
    const code = rewardCode(discount);
    return (
      <div className="py-6" aria-live="polite">
        <BallIcon className="mx-auto size-14" />
        <Dialog.Title className="mt-5 text-[26px] leading-tight tracking-[-0.01em] text-ink">
          {makes === 0 ? "No baskets this time." : `${makes} of ${SHOTS}. You won ${Math.round(discount * 100)}% off.`}
        </Dialog.Title>
        {discount > 0 ? (
          <>
            <Dialog.Description className="mt-3 text-[13px] text-ink-soft">
              It is already applied to your bag. Your code:
            </Dialog.Description>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(code).catch(() => {});
                setCopied(true);
              }}
              className="mx-auto mt-4 block rounded-md border border-dashed border-ink/40 bg-white px-6 py-3 font-mono text-lg tracking-[0.15em]"
            >
              {code}
            </button>
            <p className="mt-2 h-4 text-[11px] text-ink-soft">{copied ? "Copied" : "Tap to copy"}</p>
          </>
        ) : (
          <Dialog.Description className="mt-3 text-[13px] text-ink-soft">Every shot counts. Try again?</Dialog.Description>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setResults([]);
              setShot(0);
              setBall({ ...START, vx: 0, vy: 0, in: false });
              setPhase("aim");
            }}
            className="h-11 rounded-pill border border-ink/20 px-5 text-sm hover:border-ink"
          >
            Play again
          </button>
          <Dialog.Close className="h-11 rounded-pill bg-ink px-6 text-sm text-paper">Start shopping</Dialog.Close>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog.Title className="mt-5 text-[26px] leading-tight tracking-[-0.01em] text-ink">
        Shoot {SHOTS}. Win up to 15% off.
      </Dialog.Title>
      <Dialog.Description className="mx-auto mt-3 max-w-[16rem] text-[13px] leading-[1.6] text-ink-soft">
        Drag the ball, follow the dotted line and release.
      </Dialog.Description>
      <div className="mt-6 flex items-center justify-center gap-4" aria-live="polite">
        <span className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: SHOTS }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-[2px] w-[18px] transition-colors",
                results[i] === true ? "bg-[#e0662a]" : results[i] === false ? "bg-ink/50" : "bg-ink/15",
              )}
            />
          ))}
        </span>
        <span className="text-[10px] tracking-[0.25em] text-ink-soft uppercase">
          {phase === "between" ? (results.at(-1) ? "Swish!" : "Missed") : `Shot ${shot + 1} of ${SHOTS}`}
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 300 300"
        className="mx-auto mt-4 block w-full max-w-[300px] touch-none select-none"
        role="img"
        aria-label="Basketball hoop"
        onPointerMove={(e) => pull && setPull(toSvg(e))}
        onPointerUp={() => {
          if (!aimed) return;
          launch(aimed.dx, aimed.dy);
        }}
        onPointerCancel={() => setPull(null)}
      >
        {/* Backboard */}
        <rect x="98" y="16" width="104" height="100" fill="#fff" stroke="#e1e3e6" />
        <text x="150" y="40" textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="2.4" fill="#111">
          PLAY &amp; WIN
        </text>
        <rect x="129" y="72" width="42" height="34" fill="none" stroke="#e0662a" strokeWidth="1.6" />
        {/* Back of the rim */}
        <path d={`M${RIM.x - RIM.rx} ${RIM.y} A${RIM.rx} ${RIM.ry} 0 0 1 ${RIM.x + RIM.rx} ${RIM.y}`} fill="none" stroke="#c4501d" strokeWidth="3" />

        {!inFront && <BallShape x={shown.x} y={shown.y} r={BALL_R * scale} />}

        {/* Net and the front of the rim */}
        <g stroke="#c8ccd1" strokeWidth="0.9" fill="none">
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 8;
            const top = RIM.x - RIM.rx + t * RIM.rx * 2;
            const bottom = RIM.x - 21 + t * 42;
            return <path key={i} d={`M${top} ${RIM.y + 1} L${bottom} ${RIM.y + 52}`} />;
          })}
          {[14, 28, 42].map((dy) => {
            const w = RIM.rx - (dy / 52) * 12;
            return <ellipse key={dy} cx={RIM.x} cy={RIM.y + dy} rx={w} ry={3} />;
          })}
        </g>
        <path d={`M${RIM.x - RIM.rx} ${RIM.y} A${RIM.rx} ${RIM.ry} 0 0 0 ${RIM.x + RIM.rx} ${RIM.y}`} fill="none" stroke="#e0662a" strokeWidth="3.2" />
        <rect x={RIM.x - 6} y={RIM.y - 2} width="12" height="4" fill="#e0662a" />

        {preview.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.6} fill="#111" opacity={1 - i / preview.length} />
        ))}

        {/* Floor shadow */}
        {phase === "aim" && <ellipse cx={START.x} cy={START.y + BALL_R + 3} rx={16} ry={3} fill="rgb(0 0 0 / 0.12)" />}

        {inFront && (
          <g
            className={cn(phase === "aim" && "cursor-grab active:cursor-grabbing")}
            onPointerDown={(e) => {
              if (phase !== "aim") return;
              (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId);
              setPull(toSvg(e));
            }}
          >
            <BallShape x={shown.x} y={shown.y} r={BALL_R * scale} />
          </g>
        )}
      </svg>

      <button
        type="button"
        onClick={keyShot}
        disabled={phase !== "aim"}
        className="sr-only focus:not-sr-only focus:mx-auto focus:mt-2 focus:block focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:text-paper"
      >
        Shoot
      </button>
      <p className="mt-6 text-[10px] tracking-[0.25em] text-ink-soft uppercase" aria-hidden="true">
        Pull back · Aim · Release
      </p>
    </>
  );
}

function BallShape({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r / 20})`}>
      <circle r="20" fill="#e8742f" />
      <circle r="20" fill="none" stroke="#b9531c" strokeWidth="1" />
      <path d="M-20 0H20M0-20V20M-14-14C-6-6-6 6-14 14M14-14C6-6 6 6 14 14" stroke="#7a3510" strokeWidth="1.3" fill="none" />
      <circle r="20" fill="none" stroke="rgb(255 255 255 / 0.25)" strokeWidth="3" strokeDasharray="20 200" transform="rotate(200)" />
    </g>
  );
}

function BallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="-21 -21 42 42" className={className} aria-hidden="true">
      <BallShape x={0} y={0} r={20} />
    </svg>
  );
}
