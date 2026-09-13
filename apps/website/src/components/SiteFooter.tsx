import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-brand-100 bg-brand-950 text-brand-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-serif text-lg font-semibold text-white">Gayatri Properties</div>
          <p className="mt-3 max-w-xs text-sm text-brand-300">
            Helping families and businesses find the right property across Thane and nearby
            areas — Vasant Vihar, Manpada, Majiwada, Ghodbunder Road and beyond.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Explore</div>
          <ul className="mt-3 space-y-2 text-sm text-brand-300">
            <li><Link href="/properties?transactionType=SALE" className="hover:text-white">Buy</Link></li>
            <li><Link href="/properties?transactionType=RENT" className="hover:text-white">Rent</Link></li>
            <li><Link href="/properties" className="hover:text-white">All Properties</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-brand-300">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Contact</div>
          <ul className="mt-3 space-y-2 text-sm text-brand-300">
            <li>Vasant Vihar, Thane West, Maharashtra</li>
            <li>+91 98200 00000</li>
            <li>hello@gayatriproperties.example</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-900 py-6 text-center text-xs text-brand-400">
        © {new Date().getFullYear()} Gayatri Properties. All rights reserved.
      </div>
    </footer>
  );
}
