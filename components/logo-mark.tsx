import Image from "next/image";
import Link from "next/link";

type LogoMarkProps = {
  className?: string;
  href?: string;
  priority?: boolean;
  variant?: "dark" | "light" | "muted";
};

const logoAssets = {
  dark: {
    src: "/logo.png",
    width: 321,
    height: 164,
    styleHeight: 48
  },
  light: {
    src: "/logo-white-transparent.png",
    width: 700,
    height: 296,
    styleHeight: 56
  },
  muted: {
    src: "/logo-gray.png",
    width: 296,
    height: 145,
    styleHeight: 44
  }
} as const;

export function LogoMark({ className, href = "/", priority = false, variant = "dark" }: LogoMarkProps) {
  const asset = logoAssets[variant];

  return (
    <Link
      aria-label="SK Boutique Hotel"
      className={`logo-mark${className ? ` ${className}` : ""}`}
      href={href}
    >
      <Image
        alt="SK Boutique Hotel"
        className={`logo-mark__image logo-mark__image--${variant}`}
        height={asset.height}
        priority={priority}
        src={asset.src}
        style={{ height: asset.styleHeight, width: "auto" }}
        width={asset.width}
      />
    </Link>
  );
}
