import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 mb-4">
              Yaseen Fabrics
            </h3>
            <p className="text-sm text-zinc-600">
              Premium unstitched fabrics for the discerning gentleman.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-sm text-zinc-600 hover:text-zinc-900 transition">
                  All Collections
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition">
                  Best Sellers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition">
                  Sale
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900 transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">Newsletter</h4>
            <p className="text-sm text-zinc-600 mb-4">
              Subscribe for exclusive previews and updates.
            </p>
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:outline-none focus:border-zinc-900 bg-transparent"
            />
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-8">
          <p className="text-center text-xs text-zinc-500">
            © 2025 Yaseen Fabrics. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  )
}
