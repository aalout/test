import { SliderCard } from "@/widgets/slider/model";

const PUBLIC_BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const sliderCards: SliderCard[] = [
  {
    id: "1",
    image: `${PUBLIC_BASE}/assets/images/slider/slide1.png`,
    title: "LA LAGUNA",
    link: "/la-laguna",
    type: "Fintech",
    description:
      "Разработка Telegram mini app для администрирования Telegram-каналов",
  },
  {
    id: "2",
    image: `${PUBLIC_BASE}/assets/images/slider/slide2.png`,
    title: "FLYING BOARD",
    link: "/flying-board",
    type: "Fintech",
    description: "Разработка hr-сервиса для подбора специалистов",
  },
  {
    id: "3",
    image: `${PUBLIC_BASE}/assets/images/slider/slide3.png`,
    title: "WIND SURFING",
    link: "/wind-surfing",
    type: "Fintech",
    description:
      "Разработка Telegram mini app для администрирования Telegram-каналов",
  },
  {
    id: "4",
    image: `${PUBLIC_BASE}/assets/images/slider/slide4.png`,
    title: "BLUE NATURE",
    link: "/blue-nature",
    type: "Fintech",
    description: "Разработка hr-сервиса для подбора специалистов",
  },
  {
    id: "5",
    image: `${PUBLIC_BASE}/assets/images/slider/slide5.png`,
    title: "KONTRAST",
    link: "/kontrast",
    type: "Fintech",
    description:
      "Разработка Telegram mini app для администрирования Telegram-каналов",
  },
  {
    id: "6",
    image: `${PUBLIC_BASE}/assets/images/slider/slide6.png`,
    title: "LA FABRIQUE",
    link: "/la-fabrique",
    type: "Fintech",
    description: "Разработка hr-сервиса для подбора специалистов",
  },
  {
    id: "7",
    image: `${PUBLIC_BASE}/assets/images/slider/slide7.png`,
    title: "BOTME",
    link: "/winter-forest",
    type: "Fintech",
    description:
      "Разработка Telegram mini app для администрирования Telegram-каналов",
  },
];
