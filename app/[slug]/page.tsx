import { notFound } from "next/navigation";
import { CasePage } from "@/views/case";
import { sliderCards } from "@/views/home/model";

interface CasePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CasePageRoute({ params }: CasePageProps) {
  const { slug } = await params;
  const caseData = sliderCards.find((card) => card.link === `/${slug}`);

  if (!caseData) {
    notFound();
  }

  return <CasePage caseData={caseData} />;
}

export async function generateStaticParams() {
  return sliderCards.map((card) => ({
    slug: card.link.replace("/", ""),
  }));
}
