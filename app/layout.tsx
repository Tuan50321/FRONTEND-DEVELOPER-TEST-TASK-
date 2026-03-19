import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'

export const metadata = {
  title: 'Học Online',
  description: 'Nền tảng học online hiện đại',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            
            <Header />

            {/* MAIN */}
            <main className="flex-1">
              {children}
            </main>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-white py-8">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Học Online</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-white">Về chúng tôi</a></li>
                      <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                      <li><a href="#" className="hover:text-white">Trợ giúp</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Khóa học</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-white">Development</a></li>
                      <li><a href="#" className="hover:text-white">Business</a></li>
                      <li><a href="#" className="hover:text-white">Design</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Hỗ trợ</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                      <li><a href="#" className="hover:text-white">Điều khoản</a></li>
                      <li><a href="#" className="hover:text-white">Bảo mật</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Kết nối</h3>
                    <div className="flex gap-4">
                      <a href="#" className="text-gray-400 hover:text-white">📘</a>
                      <a href="#" className="text-gray-400 hover:text-white">🐦</a>
                      <a href="#" className="text-gray-400 hover:text-white">📷</a>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                  © 2026 Học Online. Tất cả quyền được bảo lưu.
                </div>
              </div>
            </footer>

          </div>
        </AuthProvider>
      </body>
    </html>
  )
}