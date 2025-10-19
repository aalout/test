'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SliderProps } from './model';
import { Card } from './ui/card';
import styles from './index.module.css';

export const Slider = ({ cards, className }: SliderProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState<'idle' | 'centering' | 'hiding' | 'expanding'>('idle');
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

  const handleCardClick = (index: number, cardElement: HTMLAnchorElement) => {
    if (isAnimating) return;
    
    const targetCard = cards[index];
    if (!targetCard) return;

    setIsAnimating(true);
    setClickedIndex(index);
    
    // Prefetch целевой страницы
    router.prefetch(targetCard.link);
    
    // Предзагружаем изображение для бесшовного перехода
    const preloadImage = new Image();
    preloadImage.src = targetCard.image;

    // Сначала убираем hover для точного расчета позиции
    setHoveredIndex(null);
    
    // Даем небольшую задержку на снятие hover-эффекта (transition 0.5s у карточки)
    setTimeout(() => {
      // ШАГ 1: Центрируем карточку (0.8s)
      setAnimationStep('centering');
      
      // Получаем точную позицию карточки после снятия hover
      const cardRect = cardElement.getBoundingClientRect();
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      
      // Центр карточки на экране
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      
      // Вычисляем необходимое смещение контейнера
      // Нужно сдвинуть контейнер так, чтобы центр карточки совпал с центром viewport
      const deltaX = viewportCenterX - cardCenterX;
      const deltaY = viewportCenterY - cardCenterY;
      
      // Используем функциональное обновление чтобы получить актуальные значения
      setScrollOffsetX(prev => prev + deltaX);
      setScrollOffsetY(prev => prev + deltaY);

      // ШАГ 2: После центрирования скрываем остальные карточки (0.5s opacity)
      setTimeout(() => {
        setAnimationStep('hiding');
        
        // ШАГ 3: После скрытия + портала + выпрямления начинаем расширение
        // 500ms ждем исчезновения карточек + 500ms на выпрямление skew
        setTimeout(() => {
          setAnimationStep('expanding');
          
          // ШАГ 4: Дожидаемся загрузки изображения и переходим на страницу
          // Если изображение уже загружено, переходим через timeout
          const timeoutId = setTimeout(() => {
            router.push(targetCard.link);
          }, 1200);

          // Если изображение загрузится раньше, переходим сразу
          if (preloadImage.complete) {
            clearTimeout(timeoutId);
            setTimeout(() => router.push(targetCard.link), 1200);
          } else {
            preloadImage.onload = () => {
              // Изображение загружено, но даем закончить анимацию
              clearTimeout(timeoutId);
              setTimeout(() => router.push(targetCard.link), 1200);
            };
          }
        }, 1100);
      }, 800);
    }, 100); // Небольшая задержка для снятия hover
  };

  const handleWheel = (e: WheelEvent) => {
    if (isAnimating) {
      e.preventDefault();
      return;
    }
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
  }, [isAnimating]);

  return (
    <div 
      ref={sliderRef}
      className={`${styles.slider} ${className || ''} ${isAnimating ? styles.animating : ''}`}
    >
      <div 
        className={styles.sliderContainer}
        style={{ 
          transform: `translateX(${scrollOffsetX}px) translateY(${scrollOffsetY}px)`,
          transition: animationStep === 'centering' ? 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)' : 'transform 0.1s ease-out'
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            isHovered={hoveredIndex === index}
            isClicked={clickedIndex === index}
            shouldHide={clickedIndex !== null && clickedIndex !== index && (animationStep === 'hiding' || animationStep === 'expanding')}
            animationStep={animationStep}
            onHover={handleCardHover}
            onLeave={handleCardLeave}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
};
