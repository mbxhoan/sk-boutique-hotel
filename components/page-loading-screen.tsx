"use client";

type PageLoadingScreenProps = Readonly<{
  copy: string;
  title: string;
}>;

export function PageLoadingScreen({ copy, title }: PageLoadingScreenProps) {
  return (
    <div className="page-loading-screen" role="status" aria-live="polite">
      <div className="page-loading-screen__card">
        <span className="page-loading-screen__spinner" aria-hidden="true" />
        <p className="page-loading-screen__title">{title}</p>
        <p className="page-loading-screen__copy">{copy}</p>
      </div>
    </div>
  );
}
