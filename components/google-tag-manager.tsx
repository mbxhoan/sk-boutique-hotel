"use client";

import Script from "next/script";

type GoogleTagManagerProps = {
  gtmId: string;
};

function GoogleTagManagerScripts({ gtmId }: GoogleTagManagerProps) {
  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
        }}
      />
      <noscript>
        <iframe
          height="0"
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          style={{ display: "none", visibility: "hidden" }}
          title="gtm-noscript"
          width="0"
        />
      </noscript>
    </>
  );
}

export function GoogleTagManager() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gtmId) {
    return null;
  }

  return <GoogleTagManagerScripts gtmId={gtmId} />;
}
