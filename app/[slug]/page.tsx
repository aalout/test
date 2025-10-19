import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { sliderCards } from '@/views/home/model';
import styles from './page.module.css';

interface CasePageProps {
  params: {
    slug: string;
  };
}

export default function CasePage({ params }: CasePageProps) {
  const caseData = sliderCards.find(card => card.link === `/${params.slug}`);

  if (!caseData) {
    notFound();
  }

  return (
    <div className={styles.casePage}>
      <Link href="/" className={styles.backButton}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Назад</span>
      </Link>
      
      <div 
        className={styles.hero}
        style={{
          '--case-id': `card-${caseData.id}`
        } as React.CSSProperties}
      >
        <Image 
          src={caseData.image} 
          alt={caseData.title}
          className={styles.heroImage}
          fill
          priority
          quality={100}
          sizes="100vw"
          unoptimized
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{caseData.title}</h1>
        </div>
      </div>
      
      <div className={styles.content}>
        <section className={styles.section}>
          <h2>О проекте</h2>
          <p>
            Это пример контента для кейса {caseData.title}. 
            Здесь может быть детальное описание проекта, его особенности и достижения.
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
          <p>
            Результаты и достижения проекта, метрики и feedback.
          </p>
        </section>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return sliderCards.map((card) => ({
    slug: card.link.replace('/', ''),
  }));
}

