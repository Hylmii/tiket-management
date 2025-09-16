import Link from 'next/link'
import { Calendar, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">EventHub</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Platform event management terpercaya di Indonesia. Temukan event menarik, 
              beli tiket dengan mudah, dan kelola event profesional.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Menu Utama</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Jelajahi Event
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Kategori
                </Link>
              </li>
              <li>
                <Link href="/organizers" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Menjadi Organizer
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Bantuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dukungan</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help/faq" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help/contact" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">support@eventhub.id</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+62 21 1234 5678</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Jl. Sudirman No. 123<br />
                  Jakarta Selatan 12190<br />
                  Indonesia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} EventHub. Semua hak dilindungi.
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-sm">Metode Pembayaran:</span>
              <div className="flex items-center space-x-2">
                <div className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                  Transfer Bank
                </div>
                <div className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                  E-Wallet
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
