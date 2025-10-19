"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SliderProps } from "./model";
import { Card } from "./ui/card";
import styles from "./index.module.css";

export const Slider = ({ cards, className }: SliderProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState<
    "idle" | "centering" | "hiding" | "expanding"
  >("idle");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseInSlider, setIsMouseInSlider] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const router = useRouter();

  const handleCardHover = (index: number) => {
    if (!isAnimating) {
      setHoveredIndex(index);
    }
  };

  const handleCardLeave = () => {
    if (!isAnimating) {
      setHoveredIndex(null);
    }
  };

  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleSliderMouseEnter = () => {
    setIsMouseInSlider(true);
  };

  const handleSliderMouseLeave = () => {
    setIsMouseInSlider(false);
    setHoveredIndex(null);
  };

  const handleCardClick = (index: number, cardElement: HTMLAnchorElement) => {
    if (isAnimating) return;

    const targetCard = cards[index];
    if (!targetCard) return;

    setIsAnimating(true);
    setClickedIndex(index);

    router.prefetch(targetCard.link);

    const preloadImage = new Image();
    preloadImage.src = targetCard.image;

    setHoveredIndex(null);

    setTimeout(() => {
      setAnimationStep("centering");

      const cardRect = cardElement.getBoundingClientRect();
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;

      const deltaX = viewportCenterX - cardCenterX;
      const deltaY = viewportCenterY - cardCenterY;

      setScrollOffsetX((prev) => prev + deltaX);
      setScrollOffsetY((prev) => prev + deltaY);

      setTimeout(() => {
        setAnimationStep("hiding");

        setTimeout(() => {
          setAnimationStep("expanding");

          const timeoutId = setTimeout(() => {
            router.push(targetCard.link);
          }, 1200);

          if (preloadImage.complete) {
            clearTimeout(timeoutId);
            setTimeout(() => router.push(targetCard.link), 1200);
          } else {
            preloadImage.onload = () => {
              clearTimeout(timeoutId);
              setTimeout(() => router.push(targetCard.link), 1200);
            };
          }
        }, 1100);
      }, 800);
    }, 100);
  };

  const handleWheel = (e: WheelEvent) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const deltaX = e.deltaY * 0.45;
    const deltaY = e.deltaY * 0.2;
    setScrollOffsetX((prev) => prev + deltaX);
    setScrollOffsetY((prev) => prev - deltaY);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("wheel", handleWheel, { passive: false });
      return () => slider.removeEventListener("wheel", handleWheel);
    }
  }, [isAnimating]);

  const currentCard = hoveredIndex !== null ? cards[hoveredIndex] : cards[0];
  const shouldHideInfo =
    animationStep === "hiding" || animationStep === "expanding";

  return (
    <section className={styles.root}>
      <aside
        className={`${styles.caseInfo} ${shouldHideInfo ? styles.hidden : ""}`}
      >
        <h3>{currentCard?.type || ""}</h3>
        <p>{currentCard?.description || ""}</p>
      </aside>
      <div
        ref={sliderRef}
        className={`${styles.slider} ${className || ""} ${
          isAnimating ? styles.animating : ""
        }`}
        onMouseMove={handleSliderMouseMove}
        onMouseEnter={handleSliderMouseEnter}
        onMouseLeave={handleSliderMouseLeave}
      >
        <div
          className={styles.sliderContainer}
          style={{
            transform: `translateX(${scrollOffsetX}px) translateY(${scrollOffsetY}px)`,
            transition:
              animationStep === "centering"
                ? `transform var(--duration-slowest) var(--timing-cubic-smooth-out)`
                : `transform var(--duration-fast) var(--timing-ease-out)`,
          }}
        >
          {cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              isHovered={hoveredIndex === index}
              isClicked={clickedIndex === index}
              shouldHide={
                clickedIndex !== null &&
                clickedIndex !== index &&
                (animationStep === "hiding" || animationStep === "expanding")
              }
              animationStep={animationStep}
              onHover={handleCardHover}
              onLeave={handleCardLeave}
              onClick={handleCardClick}
            />
          ))}
        </div>

        {isMouseInSlider && hoveredIndex !== null && currentCard && (
          <h4
            className={styles.followingTitle}
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
            }}
          >
            {currentCard.title}
          </h4>
        )}
      </div>
      <h3
        className={`${styles.casesTitle} ${
          shouldHideInfo ? styles.hidden : ""
        }`}
      >
        кейсы
      </h3>
    </section>
  );
};
