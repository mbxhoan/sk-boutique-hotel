"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page-error-screen" role="alert" aria-live="assertive">
      <section className="page-error-screen__card">
        <p className="page-error-screen__eyebrow">Xin lỗi — đã có lỗi xảy ra</p>
        <h1 className="page-error-screen__title">Chúng tôi gặp chút trục trặc</h1>
        <p className="page-error-screen__copy">
          Ứng dụng hiện không thể tải nội dung. Bạn có thể thử lại hoặc quay về trang chủ.
        </p>
        <div className="page-error-screen__actions">
          <button className="button button--solid" onClick={() => reset()} type="button">
            Thử lại
          </button>
          <Link className="button button--ghost" href="/">
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
