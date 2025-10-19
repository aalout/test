import Link from "next/link";
import { CaseHero } from "@/widgets/hero";
import { SliderCard } from "@/widgets/slider/model";
import styles from "./index.module.css";

interface CasePageProps {
  caseData: SliderCard;
}

export const CasePage = ({ caseData }: CasePageProps) => {
  return (
    <div className={styles.casePage}>
      <Link href="/" className={styles.backButton}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 12H5M5 12L12 19M5 12L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Назад</span>
      </Link>

      <CaseHero caseData={caseData} />

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>О проекте</h2>
          <p>
            Это пример контента для кейса {caseData.title}. Здесь может быть
            детальное описание проекта, его особенности и достижения.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Технологии</h2>
          <p>
            Описание использованных технологий и подходов в разработке проекта.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Результаты</h2>
          <p>Результаты и достижения проекта, метрики и feedback.</p>
        </section>
      </div>
    </div>
  );
};
