import { SliderCard } from '../../model';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from './index.module.css';

interface CardProps {
  card: SliderCard;
  index: number;
  isHovered: boolean;
  onHover: (index: number) => void;
  onLeave: () => void;
  isClicked: boolean;
  shouldHide: boolean;
  animationStep: 'idle' | 'centering' | 'hiding' | 'expanding';
  onClick: (index: number, element: HTMLAnchorElement) => void;
}

export const Card = ({ card, index, isHovered, onHover, onLeave, isClicked, shouldHide, animationStep, onClick }: CardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [fixedPos, setFixedPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRenderPortal, setShouldRenderPortal] = useState(false);
  const [shouldRemoveSkew, setShouldRemoveSkew] = useState(false);
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
    setIsMounted(true);
  }, []);

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
    if (cardRef.current) {
      onClick(index, cardRef.current);
    }
  };

  // Вычисляем позицию перед порталом и плавно переводим в центр
  useEffect(() => {
    if (animationStep === 'hiding' && cardRef.current && !fixedPos) {
      const rect = cardRef.current.getBoundingClientRect();
      // Сохраняем текущую позицию и размер карточки относительно VIEWPORT
      const currentPos = {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
        width: rect.width,
        height: rect.height
      };
      setFixedPos(currentPos);

      // Даем время остальным карточкам исчезнуть (0.5s opacity transition)
      setTimeout(() => {
        // Включаем портал (карточка создастся СО skew)
        setShouldRenderPortal(true);
        
        // Плавно переводим в центр экрана и убираем skew
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setFixedPos({
              ...currentPos,
              top: window.innerHeight / 2,
              left: window.innerWidth / 2
            });
            // Убираем skew для анимации
            setShouldRemoveSkew(true);
          });
        });
      }, 500); // Ждем пока остальные карточки исчезнут
    }
  }, [animationStep, fixedPos]);

  const getCardClassName = () => {
    const classes = [styles.card];
    if (shouldHide) classes.push(styles.hidden);
    if (isClicked) {
      if (animationStep === 'hiding') {
        // Добавляем класс с skew или без в зависимости от состояния
        if (shouldRemoveSkew) {
          classes.push(styles.resetTransform);
        } else if (shouldRenderPortal) {
          classes.push(styles.resetTransformWithSkew);
        }
      }
      if (animationStep === 'expanding') classes.push(styles.expanding);
    }
    return classes.join(' ');
  };

  const getCardStyle = () => {
    const baseStyle = {
      '--card-index': index,
      '--card-delay': `${index * 0.1}s`,
      '--is-hovered': isHovered ? 1 : 0,
      '--mouse-x': `${mousePosition.x}px`,
      '--mouse-y': `${mousePosition.y}px`,
      '--text-opacity': isVisible ? 1 : 0,
      '--card-id': isClicked ? `card-${card.id}` : 'none'
    } as React.CSSProperties;

    // На шагах hiding и expanding (в портале) устанавливаем абсолютную позицию
    if ((animationStep === 'hiding' || animationStep === 'expanding') && fixedPos && isClicked && shouldRenderPortal) {
      return {
        ...baseStyle,
        top: `${fixedPos.top}px`,
        left: `${fixedPos.left}px`,
        width: animationStep === 'hiding' ? `${fixedPos.width}px` : undefined,
        height: animationStep === 'hiding' ? `${fixedPos.height}px` : undefined
      };
    }

    return baseStyle;
  };

  const cardContent = (
    <a
      ref={cardRef}
      style={getCardStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={getCardClassName()}
      href={card.link}
    >
      <Image
        src={card.image}
        alt={card.title}
        fill
        sizes="22vw"
        quality={100}
        unoptimized
      />
      <h4>{card.title}</h4>
    </a>
  );

  // На шагах hiding и expanding рендерим через портал в body
  // Но только после задержки (shouldRenderPortal)
  if ((animationStep === 'hiding' || animationStep === 'expanding') && isClicked && isMounted && shouldRenderPortal) {
    return createPortal(cardContent, document.body);
  }

  return cardContent;
};
