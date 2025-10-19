import { notFound } from "next/navigation";
import { CasePage } from "@/views/case";
import { sliderCards } from "@/views/home/model";

interface CasePageProps {
  params: {
    slug: string;
  };
}

export default function CasePageRoute({ params }: CasePageProps) {
  const caseData = sliderCards.find((card) => card.link === `/${params.slug}`);

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
