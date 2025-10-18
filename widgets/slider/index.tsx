'use client';

import { useState, useRef, useEffect } from 'react';
import { SliderProps } from './model';
import { Card } from './ui/card';
import styles from './index.module.css';

export const Slider = ({ cards, className }: SliderProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleCardHover = (index: number) => {
    setHoveredIndex(index);
  };

  const handleCardLeave = () => {
    setHoveredIndex(null);
  };

  const handleCardClick = (index: number) => {
    setClickedIndex(index);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const deltaX = e.deltaY * 0.45;
    const deltaY = e.deltaY * 0.2;
    setScrollOffsetX(prev => prev + deltaX);
    setScrollOffsetY(prev => prev - deltaY);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('wheel', handleWheel, { passive: false });
      return () => slider.removeEventListener('wheel', handleWheel);
    }
  }, []);

  return (
    <div 
      ref={sliderRef}
      className={`${styles.slider} ${className || ''}`}
    >
      <div 
        className={styles.sliderContainer}
        style={{ 
          transform: `translateX(${scrollOffsetX}px) translateY(${scrollOffsetY}px)` 
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            isHovered={hoveredIndex === index}
            isClicked={clickedIndex === index}
            isAnimating={clickedIndex !== null}
            onHover={handleCardHover}
            onLeave={handleCardLeave}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
};
