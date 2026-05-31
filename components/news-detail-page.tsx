"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { NewsPostRow } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/locale";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590065745988";

export type RelatedNewsCard = Pick<
  NewsPostRow,
  "id" | "slug" | "title_vi" | "title_en" | "category" | "cover_image_path" | "read_time_vi" | "read_time_en"
>;

const CATEGORY_LABELS: Record<string, { vi: string; en: string }> = {
  "cam-nang": { vi: "CẨM NANG DU LỊCH", en: "TRAVEL GUIDE" },
  "khuyen-mai": { vi: "KHUYẾN MÃI", en: "PROMOTIONS" },
  "trai-nghiem": { vi: "TRẢI NGHIỆM", en: "EXPERIENCE" },
  "am-thuc": { vi: "ẨM THỰC", en: "CUISINE" },
  "su-kien": { vi: "SỰ KIỆN", en: "EVENTS" },
  "tin-tuc": { vi: "TIN TỨC", en: "NEWS" },
  "meo-dat-phong": { vi: "MẸO ĐẶT PHÒNG", en: "BOOKING TIPS" }
};

function formatDateLong(dateStr: string | null, locale: Locale) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (locale === "en") {
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day} tháng ${month}, ${year}`;
}

function BodyContent({ html, locale }: { html: string; locale: Locale }) {
  const lines = html.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.15, letterSpacing: "-0.02em", margin: "2.4em 0 0.6em", color: "var(--ink)" }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.3rem", lineHeight: 1.25, margin: "1.8em 0 0.4em", color: "var(--ink)" }}>
          {line.slice(4)}
        </h3>
      );
    } else {
      elements.push(
        <p key={i} style={{ margin: 0, lineHeight: 1.75, color: "var(--ink)" }}>
          {line}
        </p>
      );
    }
    i++;
  }

  return <>{elements}</>;
}

export function NewsDetailPage({ post, relatedPosts, locale }: { post: NewsPostRow; relatedPosts: RelatedNewsCard[]; locale: Locale }) {
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function updateProgress() {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight + 200;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2400);
  }

  function shareTo(network: string) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const map: Record<string, string> = {
      facebook: FACEBOOK_URL,
      zalo: `https://zalo.me/share/?u=${url}&t=${title}`
    };
    if (map[network]) window.open(map[network], "_blank", "noopener,width=600,height=520");
  }

  function fallbackCopy(text: string) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
      /* ignore — still show feedback below */
    }
  }

  function copyLink() {
    const text = window.location.href;
    const onDone = () => {
      showToast(locale === "vi" ? "Đã sao chép liên kết" : "Link copied");
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1800);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onDone, () => {
        fallbackCopy(text);
        onDone();
      });
    } else {
      fallbackCopy(text);
      onDone();
    }
  }

  const body = localize(locale, { vi: post.body_vi, en: post.body_en });
  const catLabel = CATEGORY_LABELS[post.category] ?? { vi: post.category.toUpperCase(), en: post.category.toUpperCase() };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;1,500&display=swap');

        @keyframes nd-enter { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .nd-breadcrumb { animation: nd-enter 500ms cubic-bezier(0.22,1,0.36,1) both; }
        .nd-head { animation: nd-enter 620ms cubic-bezier(0.22,1,0.36,1) both; animation-delay: 60ms; }
        .nd-cover { animation: nd-enter 720ms cubic-bezier(0.22,1,0.36,1) both; animation-delay: 140ms; }
        .nd-layout { animation: nd-enter 760ms cubic-bezier(0.22,1,0.36,1) both; animation-delay: 220ms; }
        @media (prefers-reduced-motion: reduce) {
          .nd-breadcrumb, .nd-head, .nd-cover, .nd-layout { animation: none !important; }
        }

        .nd-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: transparent; z-index: 60; pointer-events: none; }
        .nd-progress__fill { height: 100%; background: linear-gradient(90deg, var(--gold) 0%, var(--gold-soft) 100%); transition: width 80ms linear; }

        .nd-breadcrumb { padding: 32px 0 8px; font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); display: flex; gap: 12px; align-items: center; }
        .nd-breadcrumb a:hover { color: var(--gold); }
        .nd-breadcrumb__sep { opacity: 0.5; }

        .nd-head { padding: 24px 0 56px; max-width: 920px; margin: 0 auto; text-align: center; }
        .nd-head__cat { display: inline-flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .nd-head__cat-line { width: 32px; height: 1px; background: var(--gold); }
        .nd-head__cat-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); }
        .nd-head__title { font-family: var(--font-display); font-weight: 700; font-size: clamp(36px, 5vw, 64px); line-height: 1.05; letter-spacing: -0.025em; margin: 0 0 28px; color: var(--ink); }
        .nd-head__deck { font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; font-size: clamp(18px, 2vw, 24px); line-height: 1.5; color: var(--muted); max-width: 680px; margin: 0 auto 36px; }
        .nd-head__meta { display: inline-flex; align-items: center; gap: 16px; font-size: 0.86rem; color: var(--muted); flex-wrap: wrap; justify-content: center; }
        .nd-head__author { font-weight: 600; color: var(--ink); }
        .nd-head__meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); }
        .nd-head__avatar { width: 40px; height: 40px; border-radius: 50%; background: #fff; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(0,12,30,0.08); }
        .nd-head__avatar img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }

        .nd-cover { margin: 0 0 64px; aspect-ratio: 21/9; overflow: hidden; border-radius: var(--radius-sm); position: relative; background: var(--surface-container-highest); }
        .nd-cover img { width: 100%; height: 100%; object-fit: cover; }
        .nd-cover__caption { position: absolute; bottom: 16px; left: 24px; background: rgba(251,249,245,0.9); backdrop-filter: blur(8px); padding: 8px 14px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--muted); font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; }

        .nd-layout { display: grid; grid-template-columns: 240px minmax(0, 1fr) 60px; gap: 48px; align-items: start; max-width: 1180px; margin: 0 auto; }
        @media (max-width: 1080px) { .nd-layout { grid-template-columns: minmax(0,1fr); } .nd-toc, .nd-share-rail { display: none; } }

        .nd-toc { position: sticky; top: 110px; align-self: start; }
        .nd-toc__label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); margin: 0 0 16px; }
        .nd-toc ol { list-style: none; counter-reset: toc; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
        .nd-toc li { counter-increment: toc; position: relative; padding-left: 32px; }
        .nd-toc li::before { content: counter(toc, decimal-leading-zero); position: absolute; left: 0; top: 1px; font-family: var(--font-display); font-size: 0.74rem; color: var(--muted); font-weight: 500; }
        .nd-toc a { color: var(--muted); font-size: 0.92rem; line-height: 1.5; display: block; transition: color 200ms; }
        .nd-toc a:hover { color: var(--ink); }

        .nd-body { font-size: 1.06rem; line-height: 1.75; color: var(--ink); max-width: 680px; margin: 0 auto; }
        .nd-body > * + * { margin-top: 1.4em; }

        .nd-share-rail { position: sticky; top: 110px; align-self: start; display: flex; flex-direction: column; gap: 12px; }
        .nd-share-rail__label { font-size: 0.66rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); writing-mode: vertical-rl; transform: rotate(180deg); margin: 0 auto 12px; padding-top: 8px; }
        .nd-share-btn { width: 40px; height: 40px; display: grid; place-items: center; background: #fff; color: var(--muted); border-radius: 50%; border: 0; cursor: pointer; transition: all 240ms; box-shadow: 0 2px 8px rgba(0,12,30,0.06); }
        .nd-share-btn:hover { color: var(--gold); transform: translateY(-2px); }
        .nd-share-btn.is-copied { background: var(--gold); color: #fff; box-shadow: 0 6px 18px rgba(0,12,30,0.18); animation: nd-pop 360ms cubic-bezier(0.34,1.56,0.64,1); }
        .nd-share-btn.is-copied:hover { color: #fff; }
        @keyframes nd-pop { 0% { transform: scale(1); } 45% { transform: scale(1.22); } 100% { transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) { .nd-share-btn.is-copied { animation: none; } }

        .nd-tags { margin-top: 56px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .nd-tags__label { font-size: 0.74rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
        .nd-tag { display: inline-flex; padding: 8px 14px; background: var(--surface-container-low); border-radius: 9999px; font-size: 0.82rem; color: var(--muted); cursor: pointer; transition: all 240ms; text-decoration: none; }
        .nd-tag:hover { background: var(--ink); color: #fbf9f5; }

        .nd-author { margin-top: 72px; padding: 32px; background: var(--surface-container-low); border-radius: var(--radius-md); display: grid; grid-template-columns: 96px 1fr auto; gap: 24px; align-items: center; }
        .nd-author__avatar { width: 96px; height: 96px; border-radius: 50%; background: #fff; overflow: hidden; border: 1px solid rgba(0,12,30,0.08); box-shadow: 0 2px 10px rgba(0,12,30,0.05); }
        .nd-author__avatar img { width: 100%; height: 100%; object-fit: contain; padding: 12px; }
        .nd-author__name { font-family: var(--font-display); font-weight: 600; font-size: 1.32rem; margin: 0 0 4px; letter-spacing: -0.01em; color: var(--ink); }
        .nd-author__role { font-size: 0.82rem; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 12px; }
        .nd-author__bio { color: var(--muted); font-size: 0.92rem; line-height: 1.6; margin: 0; }
        @media (max-width: 620px) {
          .nd-author { grid-template-columns: 64px 1fr; }
          .nd-author__cta { grid-column: 1/-1; }
        }

        .nd-related { margin-top: 120px; padding-top: 56px; position: relative; }
        .nd-related::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(to right, transparent, rgba(0,12,30,0.1), transparent); }
        .nd-related__head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px; flex-wrap: wrap; gap: 16px; }
        .nd-related__heading { font-family: var(--font-display); font-weight: 700; font-size: clamp(28px, 3.4vw, 44px); letter-spacing: -0.025em; margin: 8px 0 0; color: var(--ink); }
        .nd-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        @media (max-width: 880px) { .nd-related-grid { grid-template-columns: 1fr; } }
        .nd-related-card { display: flex; flex-direction: column; cursor: pointer; text-decoration: none; color: inherit; }
        .nd-related-card__media { aspect-ratio: 4/3; overflow: hidden; border-radius: var(--radius-sm); background: var(--surface-container-highest); margin-bottom: 18px; }
        .nd-related-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s cubic-bezier(0.22,1,0.36,1); }
        .nd-related-card:hover .nd-related-card__media img { transform: scale(1.05); }
        .nd-related-card__cat { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.16em; color: var(--gold); text-transform: uppercase; margin-bottom: 8px; }
        .nd-related-card__title { font-family: var(--font-display); font-weight: 600; font-size: 1.18rem; line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 8px; color: var(--ink); }
        .nd-related-card__meta { margin-top: auto; font-size: 0.76rem; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; }

        .nd-toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(40px); background: var(--ink); color: #fbf9f5; padding: 12px 20px; border-radius: var(--radius-md); font-size: 0.86rem; font-weight: 500; opacity: 0; pointer-events: none; z-index: 100; box-shadow: var(--shadow-soft); transition: opacity 240ms, transform 280ms cubic-bezier(0.22,1,0.36,1); }
        .nd-toast.is-show { opacity: 1; transform: translateX(-50%) translateY(0); }

        .nd-btn-ghost { display: inline-flex; align-items: center; padding: 10px 20px; border: 1px solid rgba(0,12,30,0.16); border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); text-decoration: none; transition: all 200ms; }
        .nd-btn-ghost:hover { border-color: var(--gold); color: var(--gold); }
        .nd-btn-all { display: inline-flex; align-items: center; padding: 10px 20px; border: 1px solid rgba(0,12,30,0.16); border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); text-decoration: none; transition: all 200ms; }
        .nd-btn-all:hover { border-color: var(--gold); color: var(--gold); }

        @media print {
          @page { size: A4 portrait; margin: 16mm 0; }
          html, body { background: #fff !important; overflow: visible !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .nd-progress, .site-header, .nd-share-rail, .nd-toc, .nd-toast, .nd-btn-ghost, .nd-btn-all, .site-footer { display: none !important; }
          .nd-layout { display: block !important; max-width: 100% !important; }
          .nd-body { max-width: 100% !important; margin: 0 auto !important; }
          .section-shell { max-width: 100% !important; padding-left: 18mm !important; padding-right: 18mm !important; }
          .nd-cover { aspect-ratio: auto !important; max-height: 90mm; margin-bottom: 36px !important; }
          .nd-cover img { max-height: 90mm; }
          h1, h2, h3 { break-after: avoid; }
          .nd-author, .nd-related { break-inside: avoid; }
          .nd-related { margin-top: 48px !important; }
          .nd-related-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* Reading progress */}
      <div aria-hidden className="nd-progress">
        <div className="nd-progress__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="section-shell" style={{ paddingBottom: "clamp(80px, 10vw, 160px)" }}>
        {/* Breadcrumb */}
        <nav className="nd-breadcrumb">
          <Link href={appendLocaleQuery("/news", locale)}>{locale === "vi" ? "Tạp chí" : "Journal"}</Link>
          <span className="nd-breadcrumb__sep">/</span>
          <span>{localize(locale, CATEGORY_LABELS[post.category] ?? { vi: post.category, en: post.category })}</span>
        </nav>

        {/* Article head */}
        <header className="nd-head">
          <div className="nd-head__cat">
            <span className="nd-head__cat-line" />
            <span className="nd-head__cat-label">{localize(locale, CATEGORY_LABELS[post.category] ?? { vi: post.category, en: post.category })}</span>
            <span className="nd-head__cat-line" />
          </div>
          <h1 className="nd-head__title">{localize(locale, { vi: post.title_vi, en: post.title_en })}</h1>
          {(post.excerpt_vi || post.excerpt_en) && (
            <p className="nd-head__deck">{localize(locale, { vi: post.excerpt_vi, en: post.excerpt_en })}</p>
          )}
          <div className="nd-head__meta">
            <span className="nd-head__avatar">
              {post.author_image_path && <img src={post.author_image_path} alt={post.author_name} />}
            </span>
            <span className="nd-head__author">{post.author_name}</span>
            {post.published_at && (
              <>
                <span className="nd-head__meta-dot" />
                <span>{formatDateLong(post.published_at, locale)}</span>
              </>
            )}
            {(post.read_time_vi || post.read_time_en) && (
              <>
                <span className="nd-head__meta-dot" />
                <span>{localize(locale, { vi: post.read_time_vi, en: post.read_time_en })}</span>
              </>
            )}
          </div>
        </header>

        {/* Cover */}
        {post.cover_image_path && (
          <figure className="nd-cover">
            <img src={post.cover_image_path} alt={localize(locale, { vi: post.title_vi, en: post.title_en })} />
          </figure>
        )}

        {/* Article layout */}
        <div className="nd-layout">
          {/* TOC */}
          <aside aria-label={locale === "vi" ? "Mục lục" : "Table of contents"} className="nd-toc">
            <p className="nd-toc__label">{locale === "vi" ? "MỤC LỤC" : "CONTENTS"}</p>
            <ol>
              {body.split("\n").filter((l) => l.startsWith("## ")).map((l, i) => (
                <li key={i}><a href="#">{l.slice(3)}</a></li>
              ))}
            </ol>
          </aside>

          {/* Content */}
          <article className="nd-body" ref={articleRef} id="articleContent">
            <BodyContent html={body} locale={locale} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="nd-tags">
                <span className="nd-tags__label">{locale === "vi" ? "THẺ" : "TAGS"}</span>
                {post.tags.map((tag) => (
                  <Link key={tag} className="nd-tag" href={appendLocaleQuery("/news", locale)}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author card */}
            <aside className="nd-author">
              <div className="nd-author__avatar">
                {post.author_image_path && <img src={post.author_image_path} alt={post.author_name} />}
              </div>
              <div>
                <p className="nd-author__name">{post.author_name}</p>
                <p className="nd-author__role">{localize(locale, { vi: post.author_role_vi, en: post.author_role_en })}</p>
                {(post.author_bio_vi || post.author_bio_en) && (
                  <p className="nd-author__bio">{localize(locale, { vi: post.author_bio_vi, en: post.author_bio_en })}</p>
                )}
              </div>
              <Link className="nd-btn-ghost nd-author__cta" href={appendLocaleQuery("/news", locale)}>
                {locale === "vi" ? "XEM TẤT CẢ BÀI" : "ALL POSTS →"}
              </Link>
            </aside>
          </article>

          {/* Share rail */}
          <aside aria-label={locale === "vi" ? "Chia sẻ" : "Share"} className="nd-share-rail">
            <span className="nd-share-rail__label">{locale === "vi" ? "CHIA SẺ" : "SHARE"}</span>
            <button aria-label="Facebook" className="nd-share-btn" onClick={() => shareTo("facebook")} title="Facebook" type="button">
              <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88V14.9H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.9h-2.34v6.98C18.34 21.13 22 17 22 12z" /></svg>
            </button>
            <button
              aria-label={copied ? (locale === "vi" ? "Đã sao chép" : "Copied") : locale === "vi" ? "Sao chép liên kết" : "Copy link"}
              className={`nd-share-btn${copied ? " is-copied" : ""}`}
              onClick={copyLink}
              title={copied ? (locale === "vi" ? "Đã sao chép" : "Copied") : locale === "vi" ? "Sao chép liên kết" : "Copy link"}
              type="button"
            >
              {copied ? (
                <svg key="check" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="16"><path d="M20 6 9 17l-5-5" /></svg>
              ) : (
                <svg key="link" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="16"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              )}
            </button>
          </aside>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="nd-related">
            <div className="nd-related__head">
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", margin: 0 }}>
                  {locale === "vi" ? "ĐỌC TIẾP" : "KEEP READING"}
                </p>
                <h2 className="nd-related__heading">{locale === "vi" ? "Bài viết liên quan" : "Related articles"}</h2>
              </div>
              <Link className="nd-btn-all" href={appendLocaleQuery("/news", locale)}>
                {locale === "vi" ? "TẤT CẢ BÀI VIẾT" : "ALL ARTICLES"}
              </Link>
            </div>
            <div className="nd-related-grid">
              {relatedPosts.map((rel) => (
                <Link key={rel.id} className="nd-related-card" href={appendLocaleQuery(`/news/${rel.slug}`, locale)}>
                  <div className="nd-related-card__media">
                    {rel.cover_image_path ? (
                      <img src={rel.cover_image_path} alt={localize(locale, { vi: rel.title_vi, en: rel.title_en })} loading="lazy" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "var(--surface-container-highest)" }} />
                    )}
                  </div>
                  <p className="nd-related-card__cat">
                    {localize(locale, CATEGORY_LABELS[rel.category] ?? { vi: rel.category, en: rel.category })}
                  </p>
                  <h3 className="nd-related-card__title">{localize(locale, { vi: rel.title_vi, en: rel.title_en })}</h3>
                  <p className="nd-related-card__meta">
                    {localize(locale, { vi: rel.read_time_vi, en: rel.read_time_en })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Toast */}
      <div aria-live="polite" className={`nd-toast${toastVisible ? " is-show" : ""}`} role="status">
        {toast}
      </div>
    </>
  );
}
