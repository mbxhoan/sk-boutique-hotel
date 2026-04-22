import {
  branchCollectionPageCopy,
  findBranchPageBySlug,
  getBranchStaticParams as getMockBranchStaticParams
} from "@/lib/mock/public-cms";
import type {
  CmsCollectionItem,
  CmsPageCopy
} from "@/lib/mock/public-cms";
import type { BranchRow } from "@/lib/supabase/database.types";
import { text } from "@/lib/supabase/content";
import { queryWithServiceFallback, sortByDisplayOrder } from "@/lib/supabase/queries/shared";

const branchCollectionTemplate = branchCollectionPageCopy;

function pickBranchDescription(branch: BranchRow) {
  return branch.summary_vi || branch.story_vi || branch.address_line1;
}

function pickBranchDescriptionEn(branch: BranchRow) {
  return branch.summary_en || branch.story_en || branch.address_line1;
}

function toBranchCard(branch: BranchRow): CmsCollectionItem {
  return {
    href: `/chi-nhanh/${branch.slug}`,
    eyebrow: text("Chi nhánh", "Branch"),
    title: text(branch.name_vi, branch.name_en),
    description: text(pickBranchDescription(branch), pickBranchDescriptionEn(branch)),
    meta: [
      text(branch.district, branch.district),
      text(branch.city, branch.city),
      text(branch.map_url ? "Map-ready" : branch.timezone, branch.map_url ? "Map-ready" : branch.timezone)
    ],
    tone: branch.sort_order % 2 === 0 ? "ink" : "gold"
  };
}

function patchBranchCollectionPage(branches: BranchRow[]): CmsPageCopy {
  if (!branches.length) {
    return branchCollectionTemplate;
  }

  const items = sortByDisplayOrder(branches).map(toBranchCard);

  return {
    ...branchCollectionTemplate,
    sections: branchCollectionTemplate.sections.map((section) => {
      if (section.kind === "cards" && section.id === "branch-cards") {
        return {
          ...section,
          items
        };
      }

      return section;
    })
  };
}

function toRelatedBranchCards(branches: BranchRow[], currentSlug: string) {
  return sortByDisplayOrder(branches)
    .filter((branch) => branch.slug !== currentSlug)
    .slice(0, 4)
    .map(toBranchCard);
}

function patchBranchDetailPage(branch: BranchRow, branches: BranchRow[], fallbackPage: CmsPageCopy) {
  const relatedBranches = toRelatedBranchCards(branches, branch.slug);

  return {
    ...fallbackPage,
    seo: {
      title: text(branch.seo_title_vi || branch.name_vi, branch.seo_title_en || branch.name_en),
      description: text(
        branch.seo_description_vi || pickBranchDescription(branch),
        branch.seo_description_en || pickBranchDescriptionEn(branch)
      )
    },
    sections: fallbackPage.sections.map((section) => {
      if (section.kind === "hero" && section.id === "hero") {
        return {
          ...section,
          title: text(branch.name_vi, branch.name_en),
          description: text(pickBranchDescription(branch), pickBranchDescriptionEn(branch)),
          bullets: (branch.highlights_vi.length || branch.highlights_en.length)
            ? branch.highlights_vi.map((item, index) =>
                text(item, branch.highlights_en[index] ?? branch.highlights_vi[index] ?? item)
              )
            : section.bullets,
          frame: {
            ...section.frame,
            chips: [
              branch.code,
              branch.district,
              branch.map_url ? "Map-ready" : "Address-ready"
            ]
          }
        };
      }

      if (section.kind === "stats" && section.id === "signals") {
        return {
          ...section,
          title: text("Chi tiết chi nhánh", "Branch detail"),
          description: text(
            branch.address_line1,
            branch.address_line1
          ),
          items: [
            {
              value: branch.district,
              label: text("Khu vực", "Area"),
              detail: text(branch.city, branch.city),
              tone: "paper" as const
            },
            {
              value: branch.phone ?? "24/7",
              label: text("Điện thoại", "Phone"),
              detail: text(branch.email ?? branch.timezone, branch.email ?? branch.timezone),
              tone: "gold" as const
            },
            {
              value: branch.timezone,
              label: text("Múi giờ", "Timezone"),
              detail: text(branch.country, branch.country),
              tone: "ink" as const
            },
            {
              value: branch.map_url ? "Map" : "Address",
              label: text("Vùng bản đồ", "Map zone"),
              detail: text(branch.address_line1, branch.address_line1),
              tone: "paper" as const
            }
          ]
        };
      }

      if (section.kind === "locale-zones" && section.id === "zones") {
        return {
          ...section,
          title: text("Vùng nội dung song ngữ cho branch detail", "Bilingual content zones for the branch detail"),
          description: text(
            "Các block này có thể map trực tiếp sang cột VI/EN trong CMS.",
            "These blocks map directly into VI/EN columns in the CMS."
          ),
          zones: {
            vi: {
              ...section.zones.vi,
              eyebrow: text("Nội dung VI", "VI content"),
              title: text("Mô tả chi nhánh", "Branch copy"),
              description: text(
                branch.summary_vi || branch.story_vi || branch.address_line1,
                branch.summary_vi || branch.story_vi || branch.address_line1
              ),
              bullets: branch.highlights_vi.length
                ? branch.highlights_vi.map((item) => text(item, item))
                : section.zones.vi.bullets,
              note: text(branch.address_line1, branch.address_line1)
            },
            en: {
              ...section.zones.en,
              eyebrow: text("EN content", "EN content"),
              title: text("English copy", "English copy"),
              description: text(
                branch.summary_en || branch.story_en || branch.address_line1,
                branch.summary_en || branch.story_en || branch.address_line1
              ),
              bullets: branch.highlights_en.length
                ? branch.highlights_en.map((item) => text(item, item))
                : section.zones.en.bullets,
              note: text(branch.email ?? branch.phone ?? "Map ready", branch.email ?? branch.phone ?? "Map ready")
            }
          }
        };
      }

      if (section.kind === "split" && section.id === "branch-story") {
        return {
          ...section,
          title: text(branch.name_vi, branch.name_en),
          description: text(
            branch.story_vi || branch.summary_vi || branch.address_line1,
            branch.story_en || branch.summary_en || branch.address_line1
          ),
          bullets: [
            text(branch.address_line1, branch.address_line1),
            text(branch.district, branch.district),
            text(branch.phone ?? branch.timezone, branch.phone ?? branch.timezone)
          ]
        };
      }

      if (section.kind === "cards" && section.id === "related") {
        return {
          ...section,
          items: relatedBranches.length ? relatedBranches : section.items
        };
      }

      if (section.kind === "band" && section.id === "cta") {
        return {
          ...section,
          title: text(`Liên hệ ${branch.name_vi}`, `Contact ${branch.name_en}`),
          description: text(
            "Giữ luồng contact rõ ràng để staff phản hồi nhanh.",
            "Keep the contact flow clear so staff can respond quickly."
          )
        };
      }

      return section;
    })
  };
}

export async function listBranches() {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("branches")
        .select(
          "id, slug, code, name_vi, name_en, summary_vi, summary_en, story_vi, story_en, highlights_vi, highlights_en, address_line1, address_line2, district, city, country, timezone, phone, email, map_url, hero_image_path, seo_title_vi, seo_title_en, seo_description_vi, seo_description_en, is_active, sort_order, created_at, updated_at"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name_vi", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as BranchRow[];
    },
    [] as BranchRow[]
  );
}

async function getBranchBySlug(slug: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("branches")
        .select(
          "id, slug, code, name_vi, name_en, summary_vi, summary_en, story_vi, story_en, highlights_vi, highlights_en, address_line1, address_line2, district, city, country, timezone, phone, email, map_url, hero_image_path, seo_title_vi, seo_title_en, seo_description_vi, seo_description_en, is_active, sort_order, created_at, updated_at"
        )
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as BranchRow | null;
    },
    null as BranchRow | null
  );
}

export async function loadBranchCollectionPageCopy() {
  const branches = await listBranches();
  return patchBranchCollectionPage(branches);
}

export async function loadBranchDetailPageCopy(slug: string) {
  const branch = await getBranchBySlug(slug);
  const fallbackPage = findBranchPageBySlug(slug);

  if (!branch) {
    return fallbackPage;
  }

  if (!fallbackPage) {
    return null;
  }

  const branches = await listBranches();
  return patchBranchDetailPage(branch, branches, fallbackPage);
}

export async function getBranchStaticParams() {
  const branches = await listBranches();

  if (!branches.length) {
    return getMockBranchStaticParams();
  }

  return sortByDisplayOrder(branches).map((branch) => ({ slug: branch.slug }));
}
