import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return {};
}

export default async function NewsPage({ searchParams }: PageProps) {
  notFound();
}
