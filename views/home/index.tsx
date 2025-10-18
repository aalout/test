import { Slider } from "@/widgets/slider";
import { sliderCards } from "./model";

export const Home = () => {
  return (
    <Slider cards={sliderCards} />
  );
};