import { useRef, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";

type Color = "red" | "blue" | "green" | "purple" | "yellow";
type ZoneId = "a" | "b";
type Die = { id: number; color: Color; value: number };

const COLORS: Color[] = ["red", "blue", "green", "purple", "yellow"];
const COLOR_HEX: Record<Color, string> = {
  red: "#e74c3c",
  blue: "#3498db",
  green: "#2ecc71",
  purple: "#9b59b6",
  yellow: "#f1c40f",
};

let nextId = 0;
function roll() { return Math.floor(Math.random() * 6) + 1; }
function randomColor(): Color { return COLORS[Math.floor(Math.random() * COLORS.length)]; }
function makeDie(): Die { return { id: nextId++, color: randomColor(), value: roll() }; }
function reroll(die: Die): Die { return { ...die, value: roll() }; }

function initGame() {
  return {
    a: Array.from({ length: 8 }, makeDie),
    b: Array.from({ length: 8 }, makeDie),
  };
}

function groupByValue(dice: Die[]): [number, Die[]][] {
  const map = new Map<number, Die[]>();
  for (const d of dice) {
    const g = map.get(d.value) ?? [];
    g.push(d);
    map.set(d.value, g);
  }
  return [...map.entries()].sort(([a], [b]) => a - b);
}

export default function App() {
  const [{ a, b }, setGame] = useState(initGame);
  const [isAnimating, setIsAnimating] = useState(false);
  const animatingIds = useRef(new Set<number>());

  function onDieAnimationComplete(id: number) {
    animatingIds.current.delete(id);
    if (animatingIds.current.size === 0) setIsAnimating(false);
  }

  function selectDie(die: Die, from: ZoneId) {
    if (isAnimating) return;

    const source = from === "a" ? a : b;
    const target = from === "a" ? b : a;

    const matched   = target.filter((d) => d.value === die.value);
    const remaining = target.filter((d) => d.value !== die.value);

    const newSource = [...source.filter((d) => d.id !== die.id), ...matched.map(reroll)];
    const newTarget = [...remaining, reroll(die)];

    animatingIds.current = new Set([die.id, ...matched.map((d) => d.id)]);
    setIsAnimating(true);

    setGame({
      a: from === "a" ? newSource : newTarget,
      b: from === "a" ? newTarget : newSource,
    });
  }

  const zones: { id: ZoneId; dice: Die[] }[] = [
    { id: "a", dice: a },
    { id: "b", dice: b },
  ];

  return (
    <LayoutGroup>
      <div
        style={{
          padding: 32,
          fontFamily: "sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        {zones.map(({ id, dice }) => (
          <div key={id}>
            <p style={{ margin: "0 0 16px", color: "#888" }}>
              Zone {id.toUpperCase()} — {dice.length} dice
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
              {groupByValue(dice).map(([value, group]) => (
                <motion.div
                  key={value}
                  layout
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                >
                  <span style={{ color: "#aaa", fontSize: 12, fontWeight: 600 }}>{value}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {group.map((die) => (
                      <motion.div
                        key={die.id}
                        layoutId={`die-${die.id}`}
                        onClick={() => selectDie(die, id)}
                        whileHover={isAnimating ? {} : { y: -8, scale: 1.08 }}
                        onLayoutAnimationComplete={
                          animatingIds.current.has(die.id)
                            ? () => onDieAnimationComplete(die.id)
                            : undefined
                        }
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          background: COLOR_HEX[die.color],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.9)",
                          cursor: isAnimating ? "not-allowed" : "pointer",
                          opacity: isAnimating ? 0.6 : 1,
                          userSelect: "none",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                        }}
                      >
                        {die.value}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}
