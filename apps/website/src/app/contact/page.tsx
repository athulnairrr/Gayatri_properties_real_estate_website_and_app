import { telHref, whatsappHref } from "@realestate/core";
import { FIRM_PHONE, FIRM_WHATSAPP } from "@/lib/constants";
import { ContactFormLauncher } from "@/components/ContactFormLauncher";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="container-page py-16">
      <h1 className="font-serif text-3xl font-semibold text-brand-950">Contact Us</h1>
      <p className="mt-3 max-w-xl text-brand-600">
        Have a question or looking for a specific property? Reach out and our team will get back
        to you shortly.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:max-w-md">
        <a href={telHref(FIRM_PHONE)} className="btn-secondary">
          Call Us
        </a>
        <a href={whatsappHref(FIRM_WHATSAPP)} target="_blank" rel="noreferrer" className="btn-secondary">
          WhatsApp Us
        </a>
      </div>

      <div className="mt-6">
        <ContactFormLauncher />
      </div>

      <div className="mt-10 text-sm text-brand-500">
        <p>Vasant Vihar, Thane West, Maharashtra 400606</p>
        <p>hello@gayatriproperties.example</p>
      </div>
    </div>
  );
}
