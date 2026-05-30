import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PaymentConfirmation } from "@/components/marketing/confirmation";

export default function PharmaConfirmacionPage() {
  return (
    <>
      <SiteHeader line="pharma" />
      <PaymentConfirmation variant="pharma" />
      <SiteFooter />
    </>
  );
}
