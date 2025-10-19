import Image from "next/image";
import { SliderCard } from "@/widgets/slider/model";
import styles from "./index.module.css";

interface CaseHeroProps {
  caseData: SliderCard;
}

export const CaseHero = ({ caseData }: CaseHeroProps) => {
  return (
    <div
      className={styles.hero}
      style={
        {
          "--case-id": `card-${caseData.id}`,
        } as React.CSSProperties
      }
    >
      <Image
        src={caseData.image}
        alt={caseData.title}
        className={styles.heroImage}
        fill
        priority
        sizes="100vw"
        unoptimized
      />
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{caseData.title}</h1>
      </div>
    </div>
  );
};
