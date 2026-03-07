export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigation = {
    product: [
      { name: 'Features', href: '#' },
      { name: 'How It Works', href: '#' },
      { name: 'Pricing', href: '#' },
    ],
    support: [
      { name: 'Documentation', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'FAQ', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">GK PDF Extractor</h3>
              <p className="mt-2 text-sm text-gray-600">
                Extract PDFs from ZIP files instantly.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Made with precision by GK Tools
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-xs leading-5 text-gray-500 text-center">
            &copy; {currentYear} GK Tools. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
