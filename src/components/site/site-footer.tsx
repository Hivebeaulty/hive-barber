import { addressLine } from "../../config/business.ts";
import { brand } from "../../config/brand.ts";

export function SiteFooter() {
  return (
    <footer className="border-t border-linha">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-aco sm:px-6">
        <p className="text-osso">{brand.name}, desde {brand.foundedYear}</p>
        <p>{addressLine()}</p>
      </div>
    </footer>
  );
}
