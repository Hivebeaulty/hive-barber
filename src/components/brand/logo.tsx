import Image from "next/image";
import { brand } from "../../config/brand.ts";
import { cn } from "../../lib/cn.ts";

/**
 * Logo oficial, exibida COMO FORNECIDA: só escala proporcional (width = height).
 * Não recriar com texto, não recolorir, não distorcer.
 */
export function Logo({ size = 48, priority = false, className }: { size?: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src={brand.logo.src}
      alt={brand.logo.alt}
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 rounded-full", className)}
    />
  );
}
