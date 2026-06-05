import { useRef, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import deckData from "./data/deck.json";

type Color = "red" | "blue" | "green" | "purple" | "yellow";
type Card = { id: number; color: Color; gem: Color };

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
    hand: shuffled.slice(0, 5),
    table: shuffled.slice(5, 13),
    deck: shuffled.slice(13),
  };
}

export default function App() {
  const [{ hand, table, deck }, setGame] = useState(initGame);
  const [isAnimating, setIsAnimating] = useState(false);
  const animatingIds = useRef(new Set<number>());

  function onCardAnimationComplete(id: number) {
    animatingIds.current.delete(id);
    if (animatingIds.current.size === 0) setIsAnimating(false);
  }

  function playCard(card: Card) {
    if (isAnimating) return;

    const collected = table.filter((c) => c.color === card.gem);
    const remaining = table.filter((c) => c.color !== card.gem);

    animatingIds.current = new Set([card.id, ...collected.map((c) => c.id)]);
    setIsAnimating(true);

    setGame({
      deck,
      hand: [...hand.filter((c) => c.id !== card.id), ...collected],
      table: [...remaining, card],
    });
  }

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
        <div>
          <p style={{ margin: "0 0 12px", color: "#888" }}>
            Table — {table.length} cards
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              minHeight: 110,
            }}
          >
            {table.map((card) => (
              <motion.div
                key={card.id}
                layoutId={`card-${card.id}`}
                onLayoutAnimationComplete={
                  animatingIds.current.has(card.id)
                    ? () => onCardAnimationComplete(card.id)
                    : undefined
                }
                style={makeCardStyle(card.color)}
              >
                <Gem color={card.gem} />
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <p style={{ margin: "0 0 12px", color: "#888" }}>
            Hand — {hand.length} cards{isAnimating ? " (animating…)" : ""}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {hand.map((card) => (
              <motion.div
                key={card.id}
                layoutId={`card-${card.id}`}
                onClick={() => playCard(card)}
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
