import { PropertyForm } from "@/components/PropertyForm";
import { createPropertyAction } from "@/app/actions/properties";

export const metadata = { title: "Add Property" };

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Add Property</h1>
        <p className="text-sm text-ink-500">A property code will be generated automatically.</p>
      </div>
      <PropertyForm action={createPropertyAction} submitLabel="Create Property" />
    </div>
  );
}
