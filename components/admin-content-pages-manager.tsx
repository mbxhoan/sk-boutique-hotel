import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import type { ContentPageRow } from "@/lib/supabase/queries/content-pages";
import { deleteContentPageAction, saveContentPageAction } from "@/app/(admin)/admin/content-pages/actions";

type AdminContentPagesManagerProps = {
  locale: Locale;
  pages: ContentPageRow[];
};

const pageTypeLabels: Record<Locale, Record<ContentPageRow["page_type"], string>> = {
  en: {
    home: "Home",
    page: "Page",
    collection: "Collection",
    detail: "Detail"
  },
  vi: {
    home: "Trang chủ",
    page: "Trang",
    collection: "Bộ sưu tập",
    detail: "Chi tiết"
  }
};

function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function groupPages(pages: ContentPageRow[]) {
  return pages.reduce(
    (groups, page) => {
      groups[page.page_type].push(page);
      return groups;
    },
    {
      collection: [] as ContentPageRow[],
      detail: [] as ContentPageRow[],
      home: [] as ContentPageRow[],
      page: [] as ContentPageRow[]
    }
  );
}

function ContentPageEditor({ locale, page }: { locale: Locale; page: ContentPageRow }) {
  return (
    <PortalCard className="admin-content-pages__editor" tone={page.is_published ? "default" : "soft"}>
      <div className="admin-content-pages__editor-head">
        <div>
          <PortalBadge tone={page.is_published ? "accent" : "neutral"}>
            {pageTypeLabels[locale][page.page_type]}
          </PortalBadge>
          <p className="portal-panel__eyebrow admin-content-pages__slug">{page.slug}</p>
        </div>
        <form action={deleteContentPageAction}>
          <input name="id" type="hidden" value={page.id} />
          <input name="slug" type="hidden" value={page.slug} />
          <button className="button button--text-light admin-content-pages__danger" type="submit">
            {locale === "en" ? "Delete" : "Xoá"}
          </button>
        </form>
      </div>

      <form className="admin-content-pages__form" action={saveContentPageAction}>
        <input name="id" type="hidden" value={page.id} />
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Slug" : "Slug"}</span>
          <input className="portal-field__control" name="slug" defaultValue={page.slug} />
        </label>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Page type" : "Loại trang"}</span>
          <select className="portal-field__control" name="pageType" defaultValue={page.page_type}>
            <option value="home">home</option>
            <option value="page">page</option>
            <option value="collection">collection</option>
            <option value="detail">detail</option>
          </select>
        </label>
        <div className="admin-content-pages__grid admin-content-pages__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title VI" : "Tiêu đề VI"}</span>
            <input className="portal-field__control" name="titleVi" defaultValue={page.title_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title EN" : "Tiêu đề EN"}</span>
            <input className="portal-field__control" name="titleEn" defaultValue={page.title_en} />
          </label>
        </div>
        <div className="admin-content-pages__grid admin-content-pages__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description VI" : "Mô tả VI"}</span>
            <textarea className="portal-field__control" name="descriptionVi" rows={3} defaultValue={page.description_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description EN" : "Mô tả EN"}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} defaultValue={page.description_en} />
          </label>
        </div>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Content JSON" : "Nội dung JSON"}</span>
          <textarea className="portal-field__control admin-content-pages__json" name="contentJson" rows={14} defaultValue={formatJson(page.content_json)} />
        </label>
        <div className="admin-content-pages__grid admin-content-pages__grid--three">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Thứ tự"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={page.sort_order} />
          </label>
          <label className="portal-field admin-content-pages__publish">
            <span className="portal-field__label">{locale === "en" ? "Published" : "Đã publish"}</span>
            <input className="portal-field__checkbox" name="isPublished" type="checkbox" defaultChecked={page.is_published} />
          </label>
          <div className="admin-content-pages__actions">
            <button className="button button--solid" type="submit">
              {locale === "en" ? "Save" : "Lưu"}
            </button>
          </div>
        </div>
      </form>
    </PortalCard>
  );
}

function NewContentPageForm({ locale }: { locale: Locale }) {
  return (
    <PortalCard className="admin-content-pages__editor" tone="accent">
      <PortalSectionHeading
        description={{
          en: "Create a new content page or article record.",
          vi: "Tạo một trang nội dung hoặc bài viết mới."
        }}
        eyebrow={{ en: "New record", vi: "Tạo mới" }}
        locale={locale}
        title={{ en: "Add content page", vi: "Thêm trang nội dung" }}
      />

      <form className="admin-content-pages__form" action={saveContentPageAction}>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Slug" : "Slug"}</span>
          <input className="portal-field__control" name="slug" placeholder="/about-us" />
        </label>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Page type" : "Loại trang"}</span>
          <select className="portal-field__control" name="pageType" defaultValue="page">
            <option value="home">home</option>
            <option value="page">page</option>
            <option value="collection">collection</option>
            <option value="detail">detail</option>
          </select>
        </label>
        <div className="admin-content-pages__grid admin-content-pages__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title VI" : "Tiêu đề VI"}</span>
            <input className="portal-field__control" name="titleVi" placeholder="Về chúng tôi" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title EN" : "Tiêu đề EN"}</span>
            <input className="portal-field__control" name="titleEn" placeholder="About us" />
          </label>
        </div>
        <div className="admin-content-pages__grid admin-content-pages__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description VI" : "Mô tả VI"}</span>
            <textarea className="portal-field__control" name="descriptionVi" rows={3} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description EN" : "Mô tả EN"}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} />
          </label>
        </div>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Content JSON" : "Nội dung JSON"}</span>
          <textarea className="portal-field__control admin-content-pages__json" name="contentJson" rows={14} defaultValue="{}" />
        </label>
        <div className="admin-content-pages__grid admin-content-pages__grid--three">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Thứ tự"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={0} />
          </label>
          <label className="portal-field admin-content-pages__publish">
            <span className="portal-field__label">{locale === "en" ? "Published" : "Đã publish"}</span>
            <input className="portal-field__checkbox" name="isPublished" type="checkbox" defaultChecked />
          </label>
          <div className="admin-content-pages__actions">
            <button className="button button--solid" type="submit">
              {locale === "en" ? "Create" : "Tạo"}
            </button>
          </div>
        </div>
      </form>
    </PortalCard>
  );
}

export function AdminContentPagesManager({ locale, pages }: AdminContentPagesManagerProps) {
  const groups = groupPages(pages);

  return (
    <div className="portal-content admin-content-pages">
      <PortalSectionHeading
        description={{
          en: "Manage website pages and articles directly from Supabase content_pages.",
          vi: "Quản lý trang web và bài viết trực tiếp từ content_pages trong Supabase."
        }}
        eyebrow={{ en: "Content CMS", vi: "CMS nội dung" }}
        locale={locale}
        title={{ en: "Pages & articles", vi: "Trang & bài viết" }}
      />

      <NewContentPageForm locale={locale} />

      {(["home", "page", "collection", "detail"] as const).map((type) => (
        <section className="admin-content-pages__section" key={type}>
          <PortalSectionHeading
            description={{
              en: `${groups[type].length} record(s)`,
              vi: `${groups[type].length} bản ghi`
            }}
            eyebrow={{ en: "Grouped by type", vi: "Phân loại" }}
            locale={locale}
            title={{
              en: pageTypeLabels[locale][type],
              vi: pageTypeLabels[locale][type]
            }}
          />

          <div className="admin-content-pages__stack">
            {groups[type].length ? (
              groups[type].map((page) => <ContentPageEditor key={page.id} locale={locale} page={page} />)
            ) : (
              <PortalCard tone="soft">
                <p className="portal-panel__note-copy">
                  {locale === "en" ? "No records in this group." : "Nhóm này chưa có bản ghi."}
                </p>
              </PortalCard>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
