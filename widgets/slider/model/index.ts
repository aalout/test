export interface SliderCard {
  id: string;
  image: string;
  title: string;
  link: string;
}

export interface SliderProps {
  cards: SliderCard[];
  className?: string;
}
