import { SiteHeader } from "../../components/site/site-header.tsx";
import { SiteFooter } from "../../components/site/site-footer.tsx";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
