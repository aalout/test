import { useState, useEffect, useCallback } from "react";

interface SliderBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface UseSliderBoundsProps {
  cardsCount: number;
}

export const useSliderBounds = ({ cardsCount }: UseSliderBoundsProps) => {
  const [bounds, setBounds] = useState<SliderBounds>({
    minX: -Infinity,
    maxX: Infinity,
    minY: -Infinity,
    maxY: Infinity,
  });

  const calculateBounds = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const cardWidthVw = viewportWidth < 768 ? 44 : 22;
    const cardSize = (viewportWidth * cardWidthVw) / 100;

    const offsetPerCard = cardSize * 0.3;

    const totalCardsWidth = (cardsCount - 1) * offsetPerCard;

    const wheelMultiplierX = 0.45;
    const wheelMultiplierY = 0.2;

    const startOffsetX = viewportWidth * 0.33;
    const startOffsetY = -viewportHeight * 0.26;

    const additionalBuffer = cardSize * 6;

    const endOffsetX = startOffsetX - totalCardsWidth - additionalBuffer;
    const endOffsetY =
      startOffsetY +
      ((totalCardsWidth + additionalBuffer) * wheelMultiplierY) /
        wheelMultiplierX;

    setBounds({
      minX: endOffsetX,
      maxX: startOffsetX,
      minY: startOffsetY,
      maxY: endOffsetY,
    });
  }, [cardsCount]);

  useEffect(() => {
    calculateBounds();

    const handleResize = () => {
      calculateBounds();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateBounds]);

  const clamp = useCallback(
    (value: number, axis: "x" | "y") => {
      const min = axis === "x" ? bounds.minX : bounds.minY;
      const max = axis === "x" ? bounds.maxX : bounds.maxY;
      return Math.min(Math.max(value, min), max);
    },
    [bounds]
  );

  return { bounds, clamp };
};
