// Component client-side cho trang danh sách khóa học
'use client'

// Import hooks React
import { useState, useEffect } from 'react'
// Import component CourseCard để hiển thị từng khóa học
import CourseCard from '@/components/CourseCard'
// Import component Categories để hiển thị danh mục
import Categories from '@/components/Categories'
// Import hàm fetch dữ liệu mock từ JSONPlaceholder
import { fetchCoursesFromJsonPlaceholder } from '@/utils/mockCourseData'
// Import type Course
import { Course } from '@/types/course'
// Import hooks router và search params của Next.js
import { useRouter, useSearchParams } from 'next/navigation'
// Import type CategoryItem từ component Categories
import type { CategoryItem } from '@/components/Categories'

// Số khóa học hiển thị mỗi trang
const PAGE_SIZE = 9

// Hàm chuyển đổi string thành title case (viết hoa chữ đầu mỗi từ)
function titleCase(input: string) {
  return input
    .split(/[\s-]+/g) // Tách theo khoảng trắng hoặc dấu gạch ngang
    .filter(Boolean) // Loại bỏ chuỗi rỗng
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)) // Viết hoa chữ đầu
    .join(' ') // Ghép lại thành chuỗi
}

// Hàm trả về icon phù hợp cho từng danh mục dựa trên slug
function iconForCategorySlug(slug: string) {
  if (slug === 'all') return '📚' // Icon cho tất cả
  if (/(phone|smartphone|mobile)/i.test(slug)) return '📱' // Icon cho điện thoại
  if (/(laptop|computer|pc)/i.test(slug)) return '💻' // Icon cho máy tính
  if (/(beauty|skin|fragrance)/i.test(slug)) return '🧴' // Icon cho làm đẹp
  if (/(furniture|home|kitchen)/i.test(slug)) return '🏠' // Icon cho nội thất
  if (/(grocer|food)/i.test(slug)) return '🛒' // Icon cho thực phẩm
  if (/(sports)/i.test(slug)) return '🏅' // Icon cho thể thao
  return '🏷️' // Icon mặc định
}

// Component chính trang khóa học
export default function CoursesPage() {
  // Hook router để cập nhật URL
  const router = useRouter()
  // Hook lấy search params từ URL
  const searchParams = useSearchParams()

  // State lưu danh mục được chọn
  const [selectedCategory, setSelectedCategory] = useState('all')
  // State lưu tất cả khóa học từ API
  const [allCourses, setAllCourses] = useState<Course[]>([])
  // State lưu từ khóa tìm kiếm
  const [search, setSearch] = useState('')
  // State lưu bộ lọc độ khó
  const [levelFilter, setLevelFilter] = useState<'All' | Course['level']>('All')
  // State lưu trang hiện tại
  const [page, setPage] = useState(1)
  // State lưu danh sách các danh mục với số lượng
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([
    { id: 'all', name: 'Tất cả', count: 0, icon: '📚' },
  ])
  // State lưu khóa học đã được lọc
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  // State loading khi đang tải dữ liệu
  const [loading, setLoading] = useState(true)
  // State lưu lỗi nếu có
  const [error, setError] = useState<string | null>(null)

  // useEffect để đồng bộ state với URL params khi component mount hoặc URL thay đổi
  useEffect(() => {
    // Lấy category từ URL
    const categoryFromUrl = searchParams.get('category')
    // Lấy page từ URL, mặc định là 1
    const pageFromUrl = Number(searchParams.get('page') || '1')
    // Lấy query search từ URL
    const qFromUrl = searchParams.get('q') || ''

    // Cập nhật selectedCategory nếu khác với URL
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl)
    }
    // Reset về 'all' nếu không có category trong URL
    if (!categoryFromUrl && selectedCategory !== 'all') {
      setSelectedCategory('all')
    }
    // Cập nhật page nếu hợp lệ và khác với state hiện tại
    if (!Number.isNaN(pageFromUrl) && pageFromUrl >= 1 && pageFromUrl !== page) {
      setPage(pageFromUrl)
    }
    // Cập nhật search nếu khác với URL
    if (qFromUrl !== search) {
      setSearch(qFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // useEffect để fetch dữ liệu khóa học khi component mount
  useEffect(() => {
    let cancelled = false // Flag để cancel request nếu component unmount
    setLoading(true) // Bật loading
    setError(null) // Xóa lỗi cũ

    // Gọi API lấy dữ liệu khóa học
    fetchCoursesFromJsonPlaceholder()
      .then((courses) => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        setAllCourses(courses) // Lưu tất cả khóa học

        // Đếm số lượng khóa học theo danh mục
        const counts = new Map<string, number>()
        for (const c of courses) {
          // Chuyển type thành slug (thay khoảng trắng bằng dấu gạch ngang)
          const slug = c.type.toLowerCase().replace(/\s+/g, '-')
          counts.set(slug, (counts.get(slug) ?? 0) + 1) // Tăng count
        }

        // Tạo danh sách category items
        const items: CategoryItem[] = [
          { id: 'all', name: 'Tất cả', count: courses.length, icon: '📚' }, // Item "Tất cả"
          // Sắp xếp theo số lượng giảm dần và tạo items cho từng category
          ...Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1]) // Sort theo count giảm dần
            .map(([slug, count]) => ({
              id: slug,
              name: titleCase(slug), // Chuyển slug thành title case
              count,
              icon: iconForCategorySlug(slug), // Icon phù hợp
            })),
        ]
        setCategoryItems(items) // Cập nhật danh sách categories
      })
      .catch((e: unknown) => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        // Lưu lỗi (nếu là Error object thì lấy message, ngược lại dùng message mặc định)
        setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu khóa học')
      })
      .finally(() => {
        if (cancelled) return // Nếu đã cancel thì không làm gì
        setLoading(false) // Tắt loading
      })

    // Cleanup function để cancel request khi component unmount
    return () => {
      cancelled = true
    }
  }, [])

  // useEffect để lọc khóa học khi các bộ lọc thay đổi
  useEffect(() => {
    // Chuẩn hóa từ khóa tìm kiếm (trim và lowercase)
    const normalizedSearch = search.trim().toLowerCase()
    // Lọc khóa học theo các tiêu chí
    const filtered = allCourses
      .filter((course) => {
        if (!normalizedSearch) return true // Nếu không có search thì giữ lại
        // Kiểm tra title có chứa từ khóa không (case insensitive)
        return course.title.toLowerCase().includes(normalizedSearch)
      })
      .filter((course) => {
        if (levelFilter === 'All') return true // Nếu không lọc level thì giữ lại
        return course.level === levelFilter // Kiểm tra level khớp
      })
      .filter((course) => {
        if (selectedCategory === 'all') return true // Nếu chọn tất cả thì giữ lại
        // Chuyển type thành slug và so sánh
        const courseType = course.type.toLowerCase().replace(/\s+/g, '-')
        return courseType === selectedCategory
      })

    setFilteredCourses(filtered) // Cập nhật danh sách đã lọc
  }, [selectedCategory, allCourses, search, levelFilter])

  // Tính toán pagination
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE)) // Tổng số trang
  const safePage = Math.min(Math.max(1, page), totalPages) // Đảm bảo page trong khoảng hợp lệ
  const startIndex = (safePage - 1) * PAGE_SIZE // Index bắt đầu của trang hiện tại
  const visibleCourses = filteredCourses.slice(startIndex, startIndex + PAGE_SIZE) // Khóa học hiển thị

  // useEffect để cập nhật page state nếu safePage khác page
  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage])

  // useEffect để reset về trang 1 khi thay đổi search/filter
  useEffect(() => {
    if (page !== 1) setPage(1) // Reset page về 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, levelFilter, selectedCategory])

  // Hàm cập nhật URL với các params mới
  const updateUrl = (next: { category?: string; page?: number; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString()) // Clone params hiện tại
    // Lấy giá trị mới hoặc giữ nguyên
    const nextCategory = next.category ?? selectedCategory
    const nextPage = next.page ?? page
    const nextQ = next.q ?? search

    // Cập nhật category param
    if (nextCategory === 'all') params.delete('category') // Xóa nếu là 'all'
    else params.set('category', nextCategory) // Set nếu khác 'all'

    // Cập nhật page param
    if (nextPage <= 1) params.delete('page') // Xóa nếu <= 1
    else params.set('page', String(nextPage)) // Set nếu > 1

    // Cập nhật q param
    if (!nextQ.trim()) params.delete('q') // Xóa nếu rỗng
    else params.set('q', nextQ) // Set nếu có giá trị

    // Tạo query string và cập nhật URL
    const qs = params.toString()
    router.replace(qs ? `/courses?${qs}#categories` : '/courses#categories')
  }

  // Hàm xử lý khi thay đổi category
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category) // Cập nhật state
    updateUrl({ category, page: 1 }) // Cập nhật URL và reset page về 1
  }

  return (
    // Container chính với background xám nhạt
    <div className="min-h-screen bg-gray-50">
      {/* Header section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            {/* Tiêu đề trang */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Khóa Học Nổi Bật
            </h1>
            {/* Mô tả */}
            <p className="text-gray-600">
              Khám phá các khóa học được yêu thích nhất từ cộng đồng học viên
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            {/* Component Categories với props */}
            <Categories
              selectedCategory={selectedCategory} // Danh mục đang chọn
              onCategoryChange={handleCategoryChange} // Hàm xử lý thay đổi
              categories={categoryItems} // Danh sách categories
            />
          </div>

          {/* Main Content - Courses */}
          <div className="lg:col-span-3">
            {/* Search & Filter section */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search input */}
              <div className="flex-1">
                <div className="flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <span className="text-gray-400">🔎</span> {/* Icon tìm kiếm */}
                  <input
                    value={search} // Giá trị từ state
                    onChange={(e) => setSearch(e.target.value)} // Cập nhật state khi nhập
                    onBlur={() => updateUrl({ q: search, page: 1 })} // Cập nhật URL khi blur
                    placeholder="Tìm kiếm theo tên khóa học..." // Placeholder
                    className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none" // Styling
                  />
                </div>
              </div>

              {/* Level filter dropdown */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Độ khó</label> {/* Label */}
                <select
                  value={levelFilter} // Giá trị từ state
                  onChange={(e) => setLevelFilter(e.target.value as 'All' | Course['level'])} // Cập nhật state
                  className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm" // Styling
                >
                  <option value="All">Tất cả</option> {/* Option tất cả */}
                  <option value="S">S</option> {/* Option S */}
                  <option value="Pres">Pres</option> {/* Option Pres */}
                  <option value="TC">TC</option> {/* Option TC */}
                  <option value="MTC">MTC</option> {/* Option MTC */}
                </select>
              </div>
            </div>

            {/* Results Header - hiển thị số lượng kết quả */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">{filteredCourses.length}</span> khóa học {/* Số lượng */}
                  {selectedCategory !== 'all' && ( // Nếu có chọn category cụ thể
                    <span className="ml-1">
                      trong danh mục <span className="font-medium capitalize">
                        {selectedCategory.replace('-', ' ')} {/* Tên category */}
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Loading State - hiển thị khi đang tải */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                {/* Spinner loading */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-20"></div>
                  <div className="relative inline-block">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-purple-600"></div>
                  </div>
                </div>
                <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải khóa học...</p> {/* Text loading */}
              </div>
            ) : error ? ( // Error State - hiển thị khi có lỗi
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                  <span className="text-2xl">⚠️</span> {/* Icon warning */}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tải dữ liệu thất bại
                </h3>
                <p className="text-gray-600 mb-6">
                  {error} {/* Thông báo lỗi */}
                </p>
                <button
                  onClick={() => window.location.reload()} // Reload trang
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700" // Styling button
                >
                  Thử lại {/* Text button */}
                </button>
              </div>
            ) : (
              <>
                {/* Courses Grid - hiển thị danh sách khóa học */}
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Render từng CourseCard */}
                    {visibleCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : ( // No Results State - khi không có kết quả
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <span className="text-2xl">📭</span> {/* Icon empty */}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Không có kết quả
                    </h3>
                    <p className="text-gray-600">
                      Không có kết quả phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc.
                    </p>
                  </div>
                )}

                {/* Pagination - chỉ hiển thị khi có kết quả */}
                {filteredCourses.length > 0 ? (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Thông tin trang */}
                    <p className="text-sm text-gray-600">
                      Trang <span className="font-semibold text-gray-900">{safePage}</span> / {totalPages} (tối đa {PAGE_SIZE} khóa học/trang)
                    </p>
                    {/* Controls pagination */}
                    <div className="flex items-center gap-2">
                      {/* Button Previous */}
                      <button
                        type="button"
                        disabled={safePage <= 1} // Disable nếu ở trang đầu
                        onClick={() => {
                          const nextPage = Math.max(1, safePage - 1) // Tính trang tiếp theo
                          setPage(nextPage) // Cập nhật state
                          updateUrl({ page: nextPage }) // Cập nhật URL
                        }}
                        className="h-11 min-w-[44px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white" // Styling
                      >
                        ← Trước {/* Text button */}
                      </button>

                      {/* Page numbers - chỉ hiển thị trên màn hình lớn */}
                      <div className="hidden sm:flex items-center gap-2">
                        {/* Render các button số trang (tối đa 7) */}
                        {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
                          const p = idx + 1 // Số trang (bắt đầu từ 1)
                          const active = p === safePage // Kiểm tra trang hiện tại
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setPage(p) // Cập nhật state
                                updateUrl({ page: p }) // Cập nhật URL
                              }}
                              className={`h-11 min-w-[44px] rounded-xl px-3 text-sm font-semibold transition ${
                                active
                                  ? 'bg-blue-600 text-white' // Styling cho trang active
                                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50' // Styling cho trang inactive
                              }`}
                            >
                              {p} {/* Số trang */}
                            </button>
                          )
                        })}
                        {/* Hiển thị "…" nếu có nhiều trang */}
                        {totalPages > 7 ? <span className="px-2 text-gray-500">…</span> : null}
                      </div>

                      {/* Button Next */}
                      <button
                        type="button"
                        disabled={safePage >= totalPages} // Disable nếu ở trang cuối
                        onClick={() => {
                          const nextPage = Math.min(totalPages, safePage + 1) // Tính trang tiếp theo
                          setPage(nextPage) // Cập nhật state
                          updateUrl({ page: nextPage }) // Cập nhật URL
                        }}
                        className="h-11 min-w-[44px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white" // Styling
                      >
                        Sau → {/* Text button */}
                      </button>
                    </div>
                  </div>
                ) : null /* Không hiển thị pagination nếu không có kết quả */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
