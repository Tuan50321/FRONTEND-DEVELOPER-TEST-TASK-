// Import file CSS global
import './globals.css'
// Import AuthProvider từ context để cung cấp authentication
import { AuthProvider } from '@/contexts/AuthContext'
// Import component Header
import Header from '@/components/Header'

// Metadata cho trang (sử dụng trong Next.js)
export const metadata = {
  title: 'Học Online', // Tiêu đề trang
  description: 'Nền tảng học online hiện đại', // Mô tả trang
}

// Component RootLayout - Layout gốc của ứng dụng
export default function RootLayout({
  children, // Children components sẽ được render vào main
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi"> {/* Ngôn ngữ tiếng Việt */}
      <body>
        {/* Bao bọc toàn bộ app với AuthProvider để cung cấp context auth */}
        <AuthProvider>
          <div className="min-h-screen flex flex-col"> {/* Layout flex column, min height full screen */}
            
            {/* Header cố định ở trên */}
            <Header />

            {/* MAIN - Nội dung chính, chiếm không gian còn lại */}
            <main className="flex-1">
              {children}
            </main>

            {/* FOOTER - Chân trang */}
            <footer className="bg-gray-900 text-white py-8">
              <div className="max-w-7xl mx-auto px-4">
                {/* Grid 4 cột cho footer links */}
                <div className="grid md:grid-cols-4 gap-8">
                  {/* Cột 1: Về Học Online */}
                  <div>
                    <h3 className="font-semibold mb-4">Học Online</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-white">Về chúng tôi</a></li>
                      <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                      <li><a href="#" className="hover:text-white">Trợ giúp</a></li>
                    </ul>
                  </div>
                  {/* Cột 2: Khóa học */}
                  <div>
                    <h3 className="font-semibold mb-4">Khóa học</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-white">Development</a></li>
                      <li><a href="#" className="hover:text-white">Business</a></li>
                      <li><a href="#" className="hover:text-white">Design</a></li>
                    </ul>
                  </div>
                  {/* Cột 3: Hỗ trợ */}
                  <div>
                    <h3 className="font-semibold mb-4">Hỗ trợ</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                      <li><a href="#" className="hover:text-white">Điều khoản</a></li>
                      <li><a href="#" className="hover:text-white">Bảo mật</a></li>
                    </ul>
                  </div>
                  {/* Cột 4: Kết nối mạng xã hội */}
                  <div>
                    <h3 className="font-semibold mb-4">Kết nối</h3>
                    <div className="flex gap-4">
                      <a href="#" className="text-gray-400 hover:text-white">📘</a> {/* Facebook */}
                      <a href="#" className="text-gray-400 hover:text-white">🐦</a> {/* Twitter */}
                      <a href="#" className="text-gray-400 hover:text-white">📷</a> {/* Instagram */}
                    </div>
                  </div>
                </div>
                {/* Copyright */}
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