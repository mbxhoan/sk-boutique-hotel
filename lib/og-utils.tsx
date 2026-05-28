import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ReactElement } from "react";

/* ------------------------------------------------------------------ */
/*  Logo helper                                                       */
/* ------------------------------------------------------------------ */

let cachedLogo: string | null = null;

export async function loadLogoDataUrl(): Promise<string> {
  if (cachedLogo) return cachedLogo;

  const logoBuffer = await readFile(join(process.cwd(), "public", "logo.png"));
  cachedLogo = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  return cachedLogo;
}

/* ------------------------------------------------------------------ */
/*  Color tokens                                                      */
/* ------------------------------------------------------------------ */

export const ogColors = {
  gold: "#af8230",
  goldBorder: "rgba(174, 131, 52, 0.55)",
  goldBorderSubtle: "rgba(174, 131, 52, 0.18)",
  ink: "#171717",
  inkSecondary: "#2e2e2e",
  inkMuted: "#4c4c4c",
  warmBg: "linear-gradient(135deg, #f6f0e5 0%, #f4ebdd 52%, #efe4d1 100%)",
  overlayWhite: "rgba(255,255,255,0.28)",
  overlayWhiteStrong: "rgba(255,255,255,0.82)"
} as const;

/* ------------------------------------------------------------------ */
/*  Shared layout                                                     */
/* ------------------------------------------------------------------ */

type OgLayoutProps = {
  /** Primary content area (left side) */
  children: ReactElement;
  /** Optional: override logo src. Defaults to standard hotel logo. */
  logoSrc: string;
  /** Optional: override footer text */
  footer?: string;
  /** Optional: footer right label */
  footerRight?: string;
};

/**
 * Premium OG card layout — 1200×630.
 *
 * Renders the warm gradient background with gold border, decorative circles,
 * logo panel on the right, and places `children` in the main content area.
 */
export function OgLayout({ children, logoSrc, footer = "www.skhotel.com.vn", footerRight = "Phu Quoc" }: OgLayoutProps) {
  return (
    <div
      style={{
        background: ogColors.warmBg,
        color: ogColors.ink,
        display: "flex",
        height: "100%",
        padding: "42px",
        position: "relative",
        width: "100%"
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          background: ogColors.overlayWhite,
          borderRadius: 999,
          height: 320,
          left: -120,
          position: "absolute",
          top: -110,
          width: 320
        }}
      />
      <div
        style={{
          background: "rgba(255,255,255,0.26)",
          borderRadius: 999,
          bottom: -140,
          position: "absolute",
          right: 110,
          height: 260,
          width: 260
        }}
      />

      {/* Main card with gold border */}
      <div
        style={{
          border: `1px solid ${ogColors.goldBorder}`,
          borderRadius: 34,
          display: "flex",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          width: "100%",
          zIndex: 1
        }}
      >
        {/* Content area */}
        <div
          style={{
            background:
              `radial-gradient(circle at top left, ${ogColors.overlayWhiteStrong}, ${ogColors.overlayWhite} 52%, rgba(255,255,255,0) 72%)`,
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 48px"
          }}
        >
          {children}

          {/* Footer */}
          <div
            style={{
              alignItems: "center",
              color: ogColors.inkMuted,
              display: "flex",
              fontSize: 28,
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex" }}>{footer}</div>
            <div
              style={{
                color: ogColors.gold,
                display: "flex",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase" as const
              }}
            >
              {footerRight}
            </div>
          </div>
        </div>

        {/* Logo panel */}
        <div
          style={{
            alignItems: "center",
            background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,242,233,0.96))",
            borderLeft: `1px solid ${ogColors.goldBorderSubtle}`,
            borderRadius: 28,
            display: "flex",
            justifyContent: "center",
            margin: "38px",
            marginLeft: 0,
            minWidth: 348,
            padding: "32px"
          }}
        >
          <img
            alt="SK Boutique Hotel logo"
            height="178"
            src={logoSrc}
            style={{ objectFit: "contain" }}
            width="300"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable text blocks                                              */
/* ------------------------------------------------------------------ */

export function OgEyebrow({ children }: { children: string }) {
  return (
    <div
      style={{
        color: ogColors.gold,
        display: "flex",
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: "-0.02em"
      }}
    >
      {children}
    </div>
  );
}

export function OgHeadline({ children, maxWidth = 680 }: { children: string; maxWidth?: number }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 72,
        fontWeight: 700,
        letterSpacing: "-0.045em",
        lineHeight: 1.05,
        maxWidth
      }}
    >
      {children}
    </div>
  );
}

export function OgDescription({ children, maxWidth = 700 }: { children: string; maxWidth?: number }) {
  return (
    <div
      style={{
        color: ogColors.inkSecondary,
        display: "flex",
        fontSize: 32,
        lineHeight: 1.35,
        maxWidth
      }}
    >
      {children}
    </div>
  );
}

export function OgBadge({ children }: { children: string }) {
  return (
    <div
      style={{
        background: "rgba(174, 131, 52, 0.12)",
        border: `1px solid ${ogColors.goldBorderSubtle}`,
        borderRadius: 12,
        color: ogColors.inkSecondary,
        display: "flex",
        fontSize: 22,
        fontWeight: 700,
        padding: "8px 18px"
      }}
    >
      {children}
    </div>
  );
}
