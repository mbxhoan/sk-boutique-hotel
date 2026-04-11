import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="section-shell not-found">
        <p className="section-heading__eyebrow">404</p>
        <h1 className="section-heading__title">Không tìm thấy trang này.</h1>
        <p className="section-heading__description">
          Route bạn mở chưa được dựng trong template hiện tại.
        </p>
        <Link className="button button--solid" href="/">
          Quay về trang chủ
        </Link>
      </div>
    </section>
  );
}
