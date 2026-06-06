import { useRef, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import deckData from "./data/deck.json";

type Color = "red" | "blue" | "green" | "purple" | "yellow";
type Card = { id: number; color: Color; gem: Color };
type ZoneId = "a" | "b";

const COLOR_HEX: Record<Color, string> = {
  red: "#e74c3c",
  blue: "#3498db",
  green: "#2ecc71",
  purple: "#9b59b6",
  yellow: "#f1c40f",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initGame() {
  const shuffled = shuffle(deckData as Card[]);
  return {
    a:    shuffled.slice(0, 8),
    b:    shuffled.slice(8, 16),
    deck: shuffled.slice(16),
  };
}

export default function App() {
  const [{ a, b, deck }, setGame] = useState(initGame);
  const [isAnimating, setIsAnimating] = useState(false);
  const animatingIds = useRef(new Set<number>());

  function onCardAnimationComplete(id: number) {
    animatingIds.current.delete(id);
    if (animatingIds.current.size === 0) setIsAnimating(false);
  }

  function playCard(card: Card, from: ZoneId) {
    if (isAnimating) return;

    const source = from === "a" ? a : b;
    const target = from === "a" ? b : a;

    const collected = target.filter((c) => c.color === card.gem);
    const remaining = target.filter((c) => c.color !== card.gem);

    const newSource = [...source.filter((c) => c.id !== card.id), ...collected];
    const newTarget = [...remaining, card];

    animatingIds.current = new Set([card.id, ...collected.map((c) => c.id)]);
    setIsAnimating(true);

    setGame({
      deck,
      a: from === "a" ? newSource : newTarget,
      b: from === "a" ? newTarget : newSource,
    });
  }

  const zones: { id: ZoneId; cards: Card[] }[] = [
    { id: "a", cards: a },
    { id: "b", cards: b },
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
        {zones.map(({ id, cards }) => (
          <div key={id}>
            <p style={{ margin: "0 0 12px", color: "#888" }}>
              Zone {id.toUpperCase()} — {cards.length} cards
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 110 }}>
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  layoutId={`card-${card.id}`}
                  onClick={() => playCard(card, id)}
                  whileHover={isAnimating ? {} : { y: -10 }}
                  onLayoutAnimationComplete={
                    animatingIds.current.has(card.id)
                      ? () => onCardAnimationComplete(card.id)
                      : undefined
                  }
                  style={{
                    ...makeCardStyle(card.color),
                    cursor: isAnimating ? "not-allowed" : "pointer",
                    opacity: isAnimating ? 0.6 : 1,
                  }}
                >
                  <Gem color={card.gem} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}

function Gem({ color }: { color: Color }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: COLOR_HEX[color],
        border: "2px solid rgba(255,255,255,255.25)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}
    />
  );
}

function makeCardStyle(color: Color): React.CSSProperties {
  return {
    width: 60,
    height: 90,
    borderRadius: 8,
    background: COLOR_HEX[color],
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    userSelect: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  };
}
