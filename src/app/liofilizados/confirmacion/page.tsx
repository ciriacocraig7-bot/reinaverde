import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PaymentConfirmation } from "@/components/marketing/confirmation";

export default function LiofilizadosConfirmacionPage() {
  return (
    <>
      <SiteHeader line="liofilizados" />
      <PaymentConfirmation variant="liofilizados" />
      <SiteFooter />
    </>
  );
}
