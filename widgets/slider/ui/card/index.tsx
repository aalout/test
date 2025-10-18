import { SliderCard } from '../../model';
import { useState, useRef, useEffect } from 'react';
import styles from './index.module.css';

interface CardProps {
  card: SliderCard;
  index: number;
  isHovered: boolean;
  isClicked: boolean;
  isAnimating: boolean;
  onHover: (index: number) => void;
  onLeave: () => void;
  onClick: (index: number) => void;
}

export const Card = ({ card, index, isHovered, isClicked, isAnimating, onHover, onLeave, onClick }: CardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const targetPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };

  const animate = () => {
    currentPosition.current.x = lerp(currentPosition.current.x, targetPosition.current.x, 0.15);
    currentPosition.current.y = lerp(currentPosition.current.y, targetPosition.current.y, 0.15);

    setMousePosition({
      x: currentPosition.current.x,
      y: currentPosition.current.y
    });

    rafId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isVisible) {
      rafId.current = requestAnimationFrame(animate);
    } else {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    }

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isVisible]);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      targetPosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onHover(index);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      currentPosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      targetPosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    onLeave();
    setIsVisible(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick(index);
  };

  return (
    <a
      ref={cardRef}
      style={{
        '--card-index': index,
        '--card-delay': `${index * 0.1}s`,
        '--is-hovered': isHovered ? 1 : 0,
        '--is-clicked': isClicked ? 1 : 0,
        '--is-animating': isAnimating ? 1 : 0,
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
        '--text-opacity': isVisible ? 1 : 0
      } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={styles.card}
      href={card.link}
    >
      <img
        src={card.image}
        alt={card.title}
      />
      <h4>{card.title}</h4>
    </a>
  );
};
