export default function Loading() {
  return (
    <div className="page-loading-screen" role="status" aria-live="polite">
      <div className="page-loading-screen__card">
        <span className="page-loading-screen__spinner" aria-hidden="true" />
        <p className="page-loading-screen__title">Đang tải</p>
        <p className="page-loading-screen__copy">Vui lòng giữ trong giây lát, chúng tôi đang chuẩn bị thông tin cho bạn.</p>
      </div>
    </div>
  );
}
