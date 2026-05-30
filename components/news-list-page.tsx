"use client";

import Link from "next/link";
import { useState } from "react";

import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { NewsPostRow } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/locale";

const CATEGORIES = [
  { key: "all", vi: "Tất cả", en: "All" },
  { key: "cam-nang", vi: "Cẩm nang Phú Quốc", en: "Phu Quoc guide" },
  { key: "khuyen-mai", vi: "Khuyến mãi", en: "Promotions" },
  { key: "trai-nghiem", vi: "Trải nghiệm", en: "Experiences" },
  { key: "am-thuc", vi: "Ẩm thực", en: "Cuisine" },
  { key: "su-kien", vi: "Sự kiện", en: "Events" },
  { key: "tin-tuc", vi: "Tin tức", en: "News" },
  { key: "meo-dat-phong", vi: "Mẹo đặt phòng", en: "Booking tips" }
];

const CATEGORY_LABELS: Record<string, { vi: string; en: string }> = Object.fromEntries(CATEGORIES.map((c) => [c.key, { vi: c.vi, en: c.en }]));

const PAGE_SIZE = 9;

function formatDate(dateStr: string | null, locale: Locale) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (locale === "en") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day} THG ${month}, ${year}`;
}

export function NewsListPage({ posts, locale }: { posts: NewsPostRow[]; locale: Locale }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);

  const featuredPost = posts.find((p) => p.is_featured) ?? posts[0] ?? null;
  const nonFeatured = posts.filter((p) => !p.is_featured || p.id !== featuredPost?.id);
  const subFeatured = nonFeatured.slice(0, 2);

  const filtered = activeCategory === "all" ? nonFeatured : nonFeatured.filter((p) => p.category === activeCategory);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagePosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categoryCounts = CATEGORIES.slice(1).reduce<Record<string, number>>((acc, c) => {
    acc[c.key] = nonFeatured.filter((p) => p.category === c.key).length;
    return acc;
  }, {});

  function handleCategory(key: string) {
    setActiveCategory(key);
    setPage(1);
  }

  return (
    <>
      <style>{`
        .news-hero { padding: 56px 0 24px; }
        .news-hero__head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 56px; gap: 32px; flex-wrap: wrap; }
        .news-hero__title { font-family: var(--font-display); font-weight: 700; font-size: clamp(48px, 8vw, 100px); line-height: 0.95; letter-spacing: -0.03em; margin: 12px 0 0; color: var(--ink); }
        .news-hero__title em { font-family: "Dancing Script", cursive; font-style: italic; font-weight: 600; color: var(--gold); letter-spacing: -0.01em; font-size: 0.92em; display: inline-block; }
        .news-hero__sub { max-width: 380px; color: var(--muted); font-size: 0.95rem; line-height: 1.7; margin: 0; }
        .news-hero__eyebrow { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin: 0 0 8px; }
        .news-hero__meta { display: flex; gap: 32px; color: var(--muted); font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 12px; align-items: center; }
        .news-hero__meta strong { color: var(--ink); font-weight: 700; font-size: 1.4rem; letter-spacing: -0.01em; text-transform: none; font-family: var(--font-display); margin-right: 6px; }

        /* Featured */
        .news-featured { display: grid; grid-template-columns: 1.25fr 1fr; min-height: 560px; position: relative; }
        .news-featured__media { position: relative; overflow: hidden; border-radius: var(--radius-sm); aspect-ratio: 4/5; background: var(--surface-container-highest); }
        .news-featured__media img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.4s cubic-bezier(0.22,1,0.36,1); }
        .news-featured:hover .news-featured__media img { transform: scale(1.04); }
        .news-featured__media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(0,12,30,0.35)); pointer-events: none; }
        .news-featured__panel { background: #fff; align-self: center; margin-left: -80px; margin-bottom: -40px; padding: 56px; position: relative; z-index: 2; box-shadow: 0 4px 40px rgba(0,12,30,0.08); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 20px; }
        .news-featured__cat { display: flex; align-items: center; gap: 12px; }
        .news-featured__cat-divider { width: 32px; height: 1px; background: var(--gold); }
        .news-featured__title { font-family: var(--font-display); font-weight: 700; font-size: clamp(28px, 3.4vw, 42px); line-height: 1.08; letter-spacing: -0.02em; margin: 0; color: var(--ink); }
        .news-featured__title a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .news-featured__excerpt { color: var(--muted); font-size: 1rem; line-height: 1.7; margin: 0; }
        .news-featured__meta { display: flex; align-items: center; gap: 16px; font-size: 0.82rem; color: var(--muted); }
        .news-featured__meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); }
        .news-featured__avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--surface-container-highest); flex-shrink: 0; overflow: hidden; }
        .news-featured__avatar img { width: 100%; height: 100%; object-fit: cover; }
        @media (max-width: 880px) {
          .news-featured { grid-template-columns: 1fr; min-height: auto; }
          .news-featured__media { aspect-ratio: 4/3; }
          .news-featured__panel { margin: -32px 16px 0; padding: 32px; }
        }

        /* Sub-featured */
        .news-sub-featured { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 96px; padding-top: 48px; position: relative; }
        .news-sub-featured::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(to right, transparent, rgba(0,12,30,0.1), transparent); }
        .news-sub-card { display: grid; grid-template-columns: 1fr 1.2fr; gap: 28px; align-items: start; cursor: pointer; }
        .news-sub-card__media { aspect-ratio: 4/5; overflow: hidden; border-radius: var(--radius-sm); background: var(--surface-container-highest); }
        .news-sub-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s cubic-bezier(0.22,1,0.36,1); }
        .news-sub-card:hover .news-sub-card__media img { transform: scale(1.05); }
        .news-sub-card__body { padding-top: 8px; }
        .news-sub-card__title { font-family: var(--font-display); font-weight: 600; font-size: 1.5rem; line-height: 1.15; letter-spacing: -0.01em; margin: 12px 0; color: var(--ink); }
        .news-sub-card__excerpt { color: var(--muted); font-size: 0.92rem; line-height: 1.65; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .news-sub-card__meta { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }
        @media (max-width: 880px) {
          .news-sub-featured { grid-template-columns: 1fr; }
          .news-sub-card { grid-template-columns: 1fr; }
          .news-sub-card__media { aspect-ratio: 16/10; }
        }

        /* Category chip */
        .news-cat-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }

        /* Filter section */
        .news-filter { margin-top: 128px; padding: 48px 0 0; }
        .news-filter__head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 24px; margin-bottom: 36px; }
        .news-filter__heading { font-family: var(--font-display); font-weight: 700; font-size: clamp(32px, 4vw, 56px); line-height: 1.05; letter-spacing: -0.025em; margin: 12px 0 0; color: var(--ink); }
        .news-filter__sort { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--muted); }

        /* Chip row */
        .chip-row { display: flex; flex-wrap: nowrap; gap: 10px; overflow-x: auto; padding: 4px 0 16px; margin-bottom: 32px; scrollbar-width: thin; }
        .chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border: 1px solid rgba(0,12,30,0.12); border-radius: 9999px; background: transparent; color: var(--ink); font-size: 0.82rem; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 200ms; font-family: inherit; }
        .chip:hover { border-color: var(--gold); color: var(--gold); }
        .chip.is-active { background: var(--ink); color: #fbf9f5; border-color: var(--ink); }
        .chip__count { font-size: 0.7rem; opacity: 0.6; }

        /* Post grid */
        .post-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px 32px; }
        @media (max-width: 980px) { .post-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 620px) { .post-grid { grid-template-columns: 1fr; gap: 36px; } }
        .post-card { display: flex; flex-direction: column; cursor: pointer; }
        .post-card__media { aspect-ratio: 4/5; overflow: hidden; border-radius: var(--radius-sm); background: var(--surface-container-highest); margin-bottom: 22px; position: relative; }
        .post-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.4s cubic-bezier(0.22,1,0.36,1); }
        .post-card:hover .post-card__media img { transform: scale(1.06); }
        .post-card__placeholder { width: 100%; height: 100%; display: grid; place-items: center; background: linear-gradient(135deg, var(--surface-container-highest), var(--surface-container-low)); }
        .post-card__placeholder svg { opacity: 0.3; }
        .post-card__title { font-family: var(--font-display); font-weight: 600; font-size: 1.32rem; line-height: 1.18; letter-spacing: -0.01em; margin: 0 0 12px; color: var(--ink); }
        .post-card__title a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .post-card__excerpt { color: var(--muted); font-size: 0.92rem; line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .post-card__meta { margin-top: auto; display: flex; align-items: center; gap: 12px; font-size: 0.76rem; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; }
        .post-card__meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); }
        .post-card__no-img { width: 100%; height: 100%; background: var(--surface-container-highest); }

        /* Empty state */
        .news-empty { grid-column: 1/-1; padding: 80px 0; text-align: center; color: var(--muted); }
        .news-empty h4 { font-family: var(--font-display); font-size: 1.6rem; color: var(--ink); margin: 0 0 8px; }

        /* Pagination */
        .pagination { margin-top: 80px; display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
        .page-btn { min-width: 44px; height: 44px; padding: 0 14px; border: 1px solid rgba(0,12,30,0.12); background: transparent; color: var(--ink); font-family: inherit; font-weight: 500; font-size: 0.92rem; border-radius: var(--radius-md); cursor: pointer; transition: all 200ms; display: grid; place-items: center; }
        .page-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
        .page-btn.is-active { background: var(--ink); color: #fbf9f5; border-color: var(--ink); }
        .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .page-ellipsis { color: var(--muted); padding: 0 8px; }
      `}</style>

      {/* Hero */}
      <section className="news-hero section-shell" style={{ paddingBottom: "clamp(80px, 10vw, 160px)" }}>
        <div className="news-hero__head">
          <div>
            <p className="news-hero__eyebrow">{locale === "vi" ? "SK BOUTIQUE — TẠP CHÍ" : "SK BOUTIQUE — JOURNAL"}</p>
            <h1 className="news-hero__title">
              {locale === "vi" ? (
                <>Câu chuyện<br /><em>đảo ngọc</em></>
              ) : (
                <>Stories of the<br /><em>pearl island</em></>
              )}
            </h1>
          </div>
          <div>
            <p className="news-hero__sub">
              {locale === "vi"
                ? "Cẩm nang du lịch Phú Quốc, trải nghiệm tại khách sạn, ẩm thực đảo và những ưu đãi dành riêng cho khách của SK Boutique Hotel."
                : "Phu Quoc travel guides, hotel stories, island cuisine, and exclusive offers reserved for guests of SK Boutique Hotel."}
            </p>
            <div className="news-hero__meta">
              <span><strong>{posts.length}</strong> {locale === "vi" ? "bài viết" : "articles"}</span>
              <span><strong>{CATEGORIES.length - 1}</strong> {locale === "vi" ? "chuyên mục" : "categories"}</span>
              <span><strong>2026</strong></span>
            </div>
          </div>
        </div>

        {/* Featured */}
        {featuredPost && (
          <article className="news-featured">
            <div className="news-featured__media">
              {featuredPost.cover_image_path ? (
                <img src={featuredPost.cover_image_path} alt={localize(locale, { vi: featuredPost.title_vi, en: featuredPost.title_en })} loading="eager" />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "var(--surface-container-highest)" }} />
              )}
            </div>
            <div className="news-featured__panel">
              <div className="news-featured__cat">
                <span className="news-cat-label">{localize(locale, CATEGORY_LABELS[featuredPost.category] ?? { vi: featuredPost.category, en: featuredPost.category })}</span>
                <span className="news-featured__cat-divider" />
                <span style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
                  {localize(locale, { vi: featuredPost.read_time_vi, en: featuredPost.read_time_en })}
                </span>
              </div>
              <h2 className="news-featured__title">
                <Link href={appendLocaleQuery(`/news/${featuredPost.slug}`, locale)}>
                  {localize(locale, { vi: featuredPost.title_vi, en: featuredPost.title_en })}
                </Link>
              </h2>
              <p className="news-featured__excerpt">
                {localize(locale, { vi: featuredPost.excerpt_vi, en: featuredPost.excerpt_en })}
              </p>
              <div className="news-featured__meta">
                <span className="news-featured__avatar">
                  {featuredPost.author_image_path && <img src={featuredPost.author_image_path} alt={featuredPost.author_name} />}
                </span>
                <span>{featuredPost.author_name}</span>
                <span className="news-featured__meta-dot" />
                <span>{formatDate(featuredPost.published_at, locale)}</span>
              </div>
            </div>
          </article>
        )}

        {/* Sub-featured */}
        {subFeatured.length > 0 && (
          <div className="news-sub-featured">
            {subFeatured.map((post) => (
              <Link key={post.id} className="news-sub-card" href={appendLocaleQuery(`/news/${post.slug}`, locale)} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="news-sub-card__media">
                  {post.cover_image_path ? (
                    <img src={post.cover_image_path} alt={localize(locale, { vi: post.title_vi, en: post.title_en })} loading="lazy" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "var(--surface-container-highest)" }} />
                  )}
                </div>
                <div className="news-sub-card__body">
                  <p className="news-cat-label">{localize(locale, CATEGORY_LABELS[post.category] ?? { vi: post.category, en: post.category })}</p>
                  <h3 className="news-sub-card__title">{localize(locale, { vi: post.title_vi, en: post.title_en })}</h3>
                  <p className="news-sub-card__excerpt">{localize(locale, { vi: post.excerpt_vi, en: post.excerpt_en })}</p>
                  <div className="news-sub-card__meta">
                    {localize(locale, { vi: post.read_time_vi, en: post.read_time_en })}
                    {post.published_at && <> · {formatDate(post.published_at, locale)}</>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Filter + Grid */}
      <section className="news-filter section-shell">
        <div className="news-filter__head">
          <div>
            <p className="news-hero__eyebrow">{locale === "vi" ? "TẤT CẢ BÀI VIẾT" : "ALL ARTICLES"}</p>
            <h2 className="news-filter__heading">{locale === "vi" ? "Chuyện chưa kể" : "Untold stories"}</h2>
          </div>
        </div>

        <div className="chip-row">
          {CATEGORIES.map((cat) => {
            const count = cat.key === "all" ? nonFeatured.length : (categoryCounts[cat.key] ?? 0);
            return (
              <button
                key={cat.key}
                className={`chip${activeCategory === cat.key ? " is-active" : ""}`}
                onClick={() => handleCategory(cat.key)}
                type="button"
              >
                <span>{localize(locale, { vi: cat.vi, en: cat.en })}</span>
                <span className="chip__count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="post-grid">
          {pagePosts.length === 0 ? (
            <div className="news-empty">
              <h4>{locale === "vi" ? "Chưa có bài viết" : "No articles yet"}</h4>
              <p>{locale === "vi" ? "Thử chọn chuyên mục khác." : "Try another category."}</p>
            </div>
          ) : (
            pagePosts.map((post) => (
              <article className="post-card" key={post.id}>
                <div className="post-card__media">
                  {post.cover_image_path ? (
                    <img src={post.cover_image_path} alt={localize(locale, { vi: post.title_vi, en: post.title_en })} loading="lazy" />
                  ) : (
                    <div className="post-card__no-img" />
                  )}
                </div>
                <p className="news-cat-label">{localize(locale, CATEGORY_LABELS[post.category] ?? { vi: post.category, en: post.category })}</p>
                <h3 className="post-card__title">
                  <Link href={appendLocaleQuery(`/news/${post.slug}`, locale)}>
                    {localize(locale, { vi: post.title_vi, en: post.title_en })}
                  </Link>
                </h3>
                <p className="post-card__excerpt">{localize(locale, { vi: post.excerpt_vi, en: post.excerpt_en })}</p>
                <div className="post-card__meta">
                  <span>{localize(locale, { vi: post.read_time_vi, en: post.read_time_en })}</span>
                  {post.published_at && (
                    <>
                      <span className="post-card__meta-dot" />
                      <span>{formatDate(post.published_at, locale)}</span>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)} type="button">←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn${p === page ? " is-active" : ""}`} onClick={() => setPage(p)} type="button">{p}</button>
            ))}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} type="button">→</button>
          </div>
        )}
      </section>
    </>
  );
}
