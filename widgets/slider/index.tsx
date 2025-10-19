"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SliderProps, useSliderBounds } from "./model";
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const router = useRouter();

  const { bounds, clamp, clampBoth } = useSliderBounds({
    cardsCount: cards.length,
  });

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAnimating) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isAnimating) return;

    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
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

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isAnimating || isDragging) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const deltaX = e.deltaY * 0.45;
      const deltaY = e.deltaY * 0.2;
      setScrollOffsetX((prev) => clamp(prev + deltaX, "x"));
      setScrollOffsetY((prev) => clamp(prev - deltaY, "y"));
    },
    [isAnimating, isDragging, clamp]
  );

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("wheel", handleWheel, { passive: false });
      return () => slider.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || isAnimating) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const scrollDeltaX = deltaY * 0.45;
      const scrollDeltaY = -deltaY * 0.2;

      setDragOffset({ x: deltaX, y: deltaY });

      const newOffsets = clampBoth(
        scrollOffsetX,
        scrollOffsetY,
        scrollDeltaX,
        scrollDeltaY
      );
      setScrollOffsetX(newOffsets.x);
      setScrollOffsetY(newOffsets.y);

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [
    isDragging,
    dragStart,
    isAnimating,
    clampBoth,
    scrollOffsetX,
    scrollOffsetY,
  ]);

  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging || isAnimating) return;

      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;

      const scrollDeltaX = deltaY * 0.45;
      const scrollDeltaY = -deltaY * 0.2;

      setDragOffset({ x: deltaX, y: deltaY });

      const newOffsets = clampBoth(
        scrollOffsetX,
        scrollOffsetY,
        scrollDeltaX,
        scrollDeltaY
      );
      setScrollOffsetX(newOffsets.x);
      setScrollOffsetY(newOffsets.y);

      setDragStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    if (isDragging) {
      document.addEventListener("touchmove", handleGlobalTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleGlobalTouchEnd);
      return () => {
        document.removeEventListener("touchmove", handleGlobalTouchMove);
        document.removeEventListener("touchend", handleGlobalTouchEnd);
      };
    }
  }, [
    isDragging,
    dragStart,
    isAnimating,
    clampBoth,
    scrollOffsetX,
    scrollOffsetY,
  ]);

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
        } ${isDragging ? styles.dragging : ""}`}
        onMouseMove={handleSliderMouseMove}
        onMouseEnter={handleSliderMouseEnter}
        onMouseLeave={handleSliderMouseLeave}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className={styles.sliderContainer}
          style={{
            transform: `translateX(${scrollOffsetX}px) translateY(${scrollOffsetY}px)`,
            transition: isDragging
              ? "none"
              : animationStep === "centering"
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
