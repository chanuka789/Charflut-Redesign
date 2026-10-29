import { useId } from "react";
import type { Garment, ModelGender } from "@/lib/schema";
import { shade } from "@/lib/color";
import { personaFor, type Persona } from "./personas";

interface ModelFigureProps {
  garment: Garment;
  /** Colour of the product being sold. */
  color: string;
  gender: ModelGender;
  /** Picks a different person per slide so the row doesn't look cloned. */
  personaIndex: number;
  /** "garment" crops to just the product, for thumbnails. */
  mode?: "model" | "garment";
  className?: string;
}

const CX = 120;

const garmentCrop: Record<Garment, string> = {
  hoodie: "22 84 196 230",
  tee: "28 92 184 190",
  cargo: "44 266 152 320",
};

/**
 * Illustrated stand-in for a studio photo of a model wearing one colour.
 * Faceless on purpose: it reads as a mannequin rather than a fake person,
 * and is swapped for a real cut-out photo once one exists.
 */
export function ModelFigure({ garment, color, gender, personaIndex, mode = "model", className }: ModelFigureProps) {
  const uid = useId().replace(/:/g, "");
  const p = personaFor(gender, personaIndex);
  const s = gender === "men" ? 58 : 50;
  const top = garment === "cargo" ? p.top : color;
  const bottom = garment === "cargo" ? color : p.bottom;
  const hemY = garment === "tee" || garment === "cargo" ? 268 : 298;
  const pocketPose = garment === "hoodie" && p.pose === "pocket";
  const onlyGarment = mode === "garment";

  const ids = {
    top: `t${uid}`,
    bottom: `b${uid}`,
    skin: `s${uid}`,
    shadow: `sh${uid}`,
  };

  return (
    <svg
      viewBox={onlyGarment ? garmentCrop[garment] : "0 0 240 600"}
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id={ids.top} x1="0" x2="1" y1="0" y2="0.35">
          <stop offset="0" stopColor={shade(top, 0.1)} />
          <stop offset="0.55" stopColor={top} />
          <stop offset="1" stopColor={shade(top, -0.22)} />
        </linearGradient>
        <linearGradient id={ids.bottom} x1="0" x2="1" y1="0" y2="0.2">
          <stop offset="0" stopColor={shade(bottom, 0.08)} />
          <stop offset="0.5" stopColor={bottom} />
          <stop offset="1" stopColor={shade(bottom, -0.24)} />
        </linearGradient>
        <linearGradient id={ids.skin} x1="0" x2="1">
          <stop offset="0" stopColor={shade(p.skin, 0.06)} />
          <stop offset="1" stopColor={shade(p.skin, -0.18)} />
        </linearGradient>
        <radialGradient id={ids.shadow}>
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {!onlyGarment && <ellipse cx={CX} cy={582} rx={92} ry={11} fill={`url(#${ids.shadow})`} />}

      {(!onlyGarment || garment === "cargo") && (
        <Trousers y={hemY - 8} fill={`url(#${ids.bottom})`} base={bottom} cargo={garment === "cargo"} />
      )}
      {!onlyGarment && <Shoes color={p.shoe} />}

      {!onlyGarment && <HairBack persona={p} />}
      {!onlyGarment && (
        <>
          <rect x={CX - 9} y={80} width={18} height={30} rx={6} fill={`url(#${ids.skin})`} />
          <ellipse cx={CX} cy={62} rx={gender === "men" ? 21 : 19} ry={26} fill={`url(#${ids.skin})`} />
          <HairFront persona={p} />
        </>
      )}

      {garment === "hoodie" && (
        <Hoodie s={s} fill={`url(#${ids.top})`} base={top} pocketPose={pocketPose && !onlyGarment} skin={`url(#${ids.skin})`} showHands={!onlyGarment} />
      )}
      {(garment === "tee" || (garment === "cargo" && !onlyGarment)) && (
        <Tee s={s} fill={`url(#${ids.top})`} base={top} skin={`url(#${ids.skin})`} showArms={!onlyGarment} />
      )}
    </svg>
  );
}

function Trousers({ y, fill, base, cargo }: { y: number; fill: string; base: string; cargo: boolean }) {
  const dark = shade(base, -0.3);
  return (
    <g>
      <path
        d={`M${CX - 50} ${y} L${CX - 1} ${y} L${CX - 3} 560 Q${CX - 30} 566 ${CX - 60} 560 Q${CX - 58} 420 ${CX - 50} ${y} Z`}
        fill={fill}
      />
      <path
        d={`M${CX + 1} ${y} L${CX + 50} ${y} Q${CX + 58} 420 ${CX + 60} 560 Q${CX + 30} 566 ${CX + 3} 560 Z`}
        fill={fill}
      />
      {/* inseam shadow and stacking folds at the hem */}
      <path d={`M${CX} ${y + 30} L${CX - 2} 560`} stroke={dark} strokeOpacity="0.35" strokeWidth="2" />
      <path
        d={`M${CX - 56} 520 q14 6 30 0 M${CX - 52} 538 q16 7 34 -1 M${CX + 22} 524 q16 6 32 -1 M${CX + 18} 542 q18 6 36 0`}
        stroke={dark}
        strokeOpacity="0.3"
        strokeWidth="1.6"
        fill="none"
      />
      {cargo && (
        <g fill={shade(base, -0.08)} stroke={dark} strokeOpacity="0.35" strokeWidth="1.2">
          <rect x={CX - 62} y={376} width={30} height={50} rx={3} />
          <rect x={CX + 32} y={376} width={30} height={50} rx={3} />
          <path d={`M${CX - 62} 376 h30 v12 h-30 Z M${CX + 32} 376 h30 v12 h-30 Z`} fill={shade(base, -0.14)} />
        </g>
      )}
    </g>
  );
}

function Shoes({ color }: { color: string }) {
  const sole = shade(color, 0.85);
  return (
    <g>
      {[-1, 1].map((dir) => {
        const x = CX + dir * 31;
        return (
          <g key={dir}>
            <path
              d={`M${x - 26} 568 Q${x - 26} 552 ${x - 8} 550 L${x + 10} 550 Q${x + 26} 554 ${x + 27} 568 Z`}
              fill={color}
            />
            <rect x={x - 28} y={566} width={56} height={9} rx={4.5} fill={sole} />
          </g>
        );
      })}
    </g>
  );
}

function Hoodie({
  s,
  fill,
  base,
  pocketPose,
  skin,
  showHands,
}: {
  s: number;
  fill: string;
  base: string;
  pocketPose: boolean;
  skin: string;
  showHands: boolean;
}) {
  const dark = shade(base, -0.28);
  const rib = shade(base, -0.1);
  const L = CX - s;
  const R = CX + s;
  return (
    <g>
      {/* sleeves sit behind the body */}
      {pocketPose ? (
        <>
          <path d={`M${L + 6} 112 Q${L - 18} 126 ${L - 16} 190 Q${L - 6} 236 ${CX - 38} 252 L${CX - 30} 232 Q${L + 18} 214 ${L + 10} 152 Z`} fill={fill} />
          <path d={`M${R - 6} 112 Q${R + 18} 126 ${R + 16} 190 Q${R + 6} 236 ${CX + 38} 252 L${CX + 30} 232 Q${R - 18} 214 ${R - 10} 152 Z`} fill={fill} />
        </>
      ) : (
        <>
          <path d={`M${L + 6} 112 Q${L - 16} 124 ${L - 22} 196 L${L - 24} 284 L${L + 2} 286 L${L + 10} 152 Z`} fill={fill} />
          <path d={`M${R - 6} 112 Q${R + 16} 124 ${R + 22} 196 L${R + 24} 284 L${R - 2} 286 L${R - 10} 152 Z`} fill={fill} />
          <rect x={L - 25} y={282} width={28} height={14} rx={4} fill={rib} />
          <rect x={R - 3} y={282} width={28} height={14} rx={4} fill={rib} />
          {showHands && (
            <>
              <ellipse cx={L - 11} cy={309} rx={9} ry={13} fill={skin} />
              <ellipse cx={R + 11} cy={309} rx={9} ry={13} fill={skin} />
            </>
          )}
        </>
      )}

      {/* body */}
      <path
        d={`M${L + 6} 112 Q${CX} 98 ${R - 6} 112 Q${R + 4} 120 ${R + 2} 140 L${R + 1} 288 Q${CX} 294 ${L - 1} 288 L${L - 2} 140 Q${L - 4} 120 ${L + 6} 112 Z`}
        fill={fill}
      />
      <path d={`M${L - 1} 284 Q${CX} 292 ${R + 1} 284 L${R + 1} 300 Q${CX} 308 ${L - 1} 300 Z`} fill={rib} />
      {/* folds */}
      <path
        d={`M${L + 14} 170 q6 50 2 104 M${R - 16} 168 q-5 52 -1 108 M${CX - 4} 168 q3 24 0 52`}
        stroke={dark}
        strokeOpacity="0.16"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* kangaroo pocket */}
      <path
        d={`M${CX - 34} 226 L${CX + 34} 226 L${CX + 44} 274 L${CX - 44} 274 Z`}
        fill={shade(base, -0.04)}
        stroke={dark}
        strokeOpacity="0.32"
        strokeWidth="1.4"
      />
      <path d={`M${CX - 34} 226 L${CX - 44} 274 M${CX + 34} 226 L${CX + 44} 274`} stroke={dark} strokeOpacity="0.45" strokeWidth="2.4" />

      {/* hood resting on the shoulders */}
      <path
        d={`M${CX - 36} 116 C${CX - 40} 92 ${CX - 22} 84 ${CX} 86 C${CX + 22} 84 ${CX + 40} 92 ${CX + 36} 116 Q${CX} 128 ${CX - 36} 116 Z`}
        fill={shade(base, 0.04)}
      />
      <path d={`M${CX - 17} 106 Q${CX} 96 ${CX + 17} 106 Q${CX} 118 ${CX - 17} 106 Z`} fill={dark} fillOpacity="0.55" />
      {/* drawcords */}
      <path d={`M${CX - 8} 113 L${CX - 10} 164 M${CX + 8} 113 L${CX + 10} 158`} stroke={shade(base, 0.55)} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

function Tee({ s, fill, base, skin, showArms }: { s: number; fill: string; base: string; skin: string; showArms: boolean }) {
  const dark = shade(base, -0.26);
  const L = CX - s + 4;
  const R = CX + s - 4;
  return (
    <g>
      {showArms && (
        <>
          <path d={`M${L - 14} 180 Q${L - 20} 240 ${L - 14} 296 L${L - 1} 296 Q${L + 2} 240 ${L + 6} 184 Z`} fill={skin} />
          <path d={`M${R + 14} 180 Q${R + 20} 240 ${R + 14} 296 L${R + 1} 296 Q${R - 2} 240 ${R - 6} 184 Z`} fill={skin} />
          <ellipse cx={L - 8} cy={306} rx={8.5} ry={12} fill={skin} />
          <ellipse cx={R + 8} cy={306} rx={8.5} ry={12} fill={skin} />
        </>
      )}
      <path d={`M${L + 4} 112 Q${L - 20} 120 ${L - 22} 190 L${L + 8} 194 L${L + 12} 150 Z`} fill={fill} />
      <path d={`M${R - 4} 112 Q${R + 20} 120 ${R + 22} 190 L${R - 8} 194 L${R - 12} 150 Z`} fill={fill} />
      <path
        d={`M${L + 4} 112 Q${CX} 102 ${R - 4} 112 Q${R + 6} 122 ${R + 4} 146 L${R + 3} 268 Q${CX} 274 ${L - 3} 268 L${L - 4} 146 Q${L - 6} 122 ${L + 4} 112 Z`}
        fill={fill}
      />
      <path d={`M${CX - 16} 106 Q${CX} 120 ${CX + 16} 106`} stroke={dark} strokeOpacity="0.55" strokeWidth="3.2" fill="none" />
      <path
        d={`M${L + 14} 170 q5 44 1 92 M${R - 14} 170 q-5 44 -1 92`}
        stroke={dark}
        strokeOpacity="0.14"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function HairBack({ persona }: { persona: Persona }) {
  const c = persona.hair;
  switch (persona.hairStyle) {
    case "long":
      return <path d={`M${CX - 24} 54 Q${CX - 30} 120 ${CX - 26} 150 L${CX + 26} 150 Q${CX + 30} 120 ${CX + 24} 54 Z`} fill={c} />;
    case "locs":
      return (
        <g stroke={c} strokeWidth="6" strokeLinecap="round">
          {[-20, -12, -4, 4, 12, 20].map((dx) => (
            <path key={dx} d={`M${CX + dx} 52 L${CX + dx * 1.15} ${118 + Math.abs(dx)}`} />
          ))}
        </g>
      );
    default:
      return null;
  }
}

function HairFront({ persona }: { persona: Persona }) {
  const c = persona.hair;
  switch (persona.hairStyle) {
    case "buzz":
      return <path d={`M${CX - 21} 58 C${CX - 22} 36 ${CX + 22} 34 ${CX + 21} 58 C${CX + 14} 46 ${CX - 14} 46 ${CX - 21} 58 Z`} fill={c} fillOpacity="0.85" />;
    case "curls":
      return (
        <g fill={c}>
          {[
            [-16, 46],
            [-6, 38],
            [6, 38],
            [16, 46],
            [-20, 58],
            [20, 58],
            [0, 44],
          ].map(([dx, y]) => (
            <circle key={`${dx}-${y}`} cx={CX + (dx ?? 0)} cy={y} r={10} />
          ))}
        </g>
      );
    case "bun":
      return (
        <g fill={c}>
          <circle cx={CX} cy={34} r={11} />
          <path d={`M${CX - 20} 60 C${CX - 22} 36 ${CX + 22} 34 ${CX + 20} 60 C${CX + 12} 46 ${CX - 12} 46 ${CX - 20} 60 Z`} />
        </g>
      );
    case "long":
    case "locs":
    case "short":
    default:
      return <path d={`M${CX - 22} 62 C${CX - 25} 32 ${CX + 25} 30 ${CX + 22} 62 C${CX + 16} 44 ${CX - 14} 44 ${CX - 22} 62 Z`} fill={c} />;
  }
}
