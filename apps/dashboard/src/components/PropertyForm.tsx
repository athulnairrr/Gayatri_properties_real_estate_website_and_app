import type { InternalProperty } from "@realestate/core";

export function PropertyForm({
  property,
  action,
  submitLabel,
}: {
  property?: InternalProperty;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6">
      {property && <input type="hidden" name="id" value={property.id} />}

      <fieldset className="card space-y-4 p-5">
        <legend className="px-1 text-sm font-semibold text-ink-900">Basics</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Title</span>
            <input name="title" required defaultValue={property?.title} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Status</span>
            <select name="status" defaultValue={property?.status ?? "AVAILABLE"} className="input-field">
              <option value="AVAILABLE">Available</option>
              <option value="HOLD">Hold</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Transaction</span>
            <select
              name="transaction_type"
              required
              defaultValue={property?.transaction_type ?? "SALE"}
              className="input-field"
            >
              <option value="SALE">Sale</option>
              <option value="RENT">Rent</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Property Type</span>
            <select
              name="property_type"
              required
              defaultValue={property?.property_type ?? "FLAT"}
              className="input-field"
            >
              <option value="FLAT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="PLOT">Plot</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={property?.description ?? ""}
            className="input-field"
          />
        </label>
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="px-1 text-sm font-semibold text-ink-900">Pricing</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Price (₹)</span>
            <input
              type="number"
              name="price"
              required
              min={0}
              defaultValue={property?.price}
              className="input-field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Negotiation Min</span>
            <input
              type="number"
              name="negotiation_min"
              min={0}
              defaultValue={property?.negotiation_min ?? undefined}
              className="input-field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Negotiation Max</span>
            <input
              type="number"
              name="negotiation_max"
              min={0}
              defaultValue={property?.negotiation_max ?? undefined}
              className="input-field"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="px-1 text-sm font-semibold text-ink-900">Location</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-ink-700">Address</span>
            <input name="address" defaultValue={property?.address ?? ""} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Locality</span>
            <input name="locality" required defaultValue={property?.locality} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">City</span>
            <input name="city" defaultValue={property?.city ?? "Thane"} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">State</span>
            <input name="state" defaultValue={property?.state ?? "Maharashtra"} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Postal Code</span>
            <input name="postal_code" defaultValue={property?.postal_code ?? ""} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Latitude</span>
            <input
              type="number"
              step="any"
              name="latitude"
              required
              defaultValue={property?.latitude}
              className="input-field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Longitude</span>
            <input
              type="number"
              step="any"
              name="longitude"
              required
              defaultValue={property?.longitude}
              className="input-field"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="px-1 text-sm font-semibold text-ink-900">Specifications</legend>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Bedrooms</span>
            <input type="number" min={0} name="bedrooms" defaultValue={property?.bedrooms ?? undefined} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Bathrooms</span>
            <input type="number" min={0} name="bathrooms" defaultValue={property?.bathrooms ?? undefined} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Parking</span>
            <input type="number" min={0} name="parking" defaultValue={property?.parking ?? undefined} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Area (sqft)</span>
            <input type="number" min={0} name="area_sqft" defaultValue={property?.area_sqft ?? undefined} className="input-field" />
          </label>
        </div>
      </fieldset>

      <fieldset className="card space-y-4 p-5">
        <legend className="px-1 text-sm font-semibold text-ink-900">
          Owner &amp; Internal Notes <span className="font-normal text-ink-400">(never shown on the public site)</span>
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Owner Name</span>
            <input name="owner_name" defaultValue={property?.owner_name ?? ""} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Owner Phone</span>
            <input name="owner_phone" defaultValue={property?.owner_phone ?? ""} className="input-field" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-700">Owner Email</span>
            <input name="owner_email" defaultValue={property?.owner_email ?? ""} className="input-field" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-700">Internal Notes</span>
          <textarea
            name="internal_notes"
            rows={3}
            defaultValue={property?.internal_notes ?? ""}
            className="input-field"
          />
        </label>
      </fieldset>

      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
