import { LocalizedPageLoadingScreen } from "@/components/localized-page-loading-screen";

export default function Loading() {
  return (
    <LocalizedPageLoadingScreen
      copy={{
        en: "Please wait a moment while we prepare your member area.",
        vi: "Vui lòng giữ trong giây lát, chúng tôi đang chuẩn bị khu vực thành viên."
      }}
      title={{
        en: "Loading",
        vi: "Đang tải"
      }}
    />
  );
}
