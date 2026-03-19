type DummyCategory = {
  slug: string
  name: string
  url?: string
}

type JsonPlaceholderPost = {
  id: number
  title: string
  body: string
}

function titleCaseFromSlug(slug: string) {
  return slug
    .split(/[\s-]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function iconForCategorySlug(slug: string) {
  if (/(phone|smartphone|mobile)/i.test(slug)) return '📱'
  if (/(laptop|computer|pc)/i.test(slug)) return '💻'
  if (/(beauty|skin|fragrance)/i.test(slug)) return '🧴'
  if (/(furniture|home|kitchen)/i.test(slug)) return '🏠'
  if (/(grocer|food)/i.test(slug)) return '🛒'
  if (/(sports)/i.test(slug)) return '🏅'
  return '🏷️'
}

function truncate(text: string, maxChars: number) {
  const t = text.trim().replace(/\s+/g, ' ')
  if (t.length <= maxChars) return t
  return `${t.slice(0, maxChars).trim()}…`
}

async function getCategories(): Promise<DummyCategory[]> {
  const res = await fetch('https://dummyjson.com/products/categories', { cache: 'no-store' })
  if (!res.ok) return []
  const data = (await res.json()) as Array<{ slug: string; name: string; url?: string }>
  return data.slice(0, 8)
}

async function getPosts(): Promise<JsonPlaceholderPost[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3', { cache: 'no-store' })
  if (!res.ok) return []
  return (await res.json()) as JsonPlaceholderPost[]
}

export default async function Home() {
  const [categories, posts] = await Promise.all([getCategories(), getPosts()])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-semibold">
                Nền tảng học online hiện đại
              </p>
              <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight">
                Học kỹ năng mới mỗi ngày,
                <span className="block text-white/90">tăng tốc sự nghiệp</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-white/90 max-w-xl">
                Khám phá danh mục khóa học đa dạng, học theo lộ trình và theo dõi tiến độ rõ ràng.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="/courses"
                  className="h-12 inline-flex items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-blue-700 shadow-sm hover:bg-white/95"
                >
                  Khám phá khóa học
                </a>
                <a
                  href="/courses#categories"
                  className="h-12 inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Xem danh mục
                </a>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">9+</p>
                  <p className="text-sm text-white/80">khóa học/trang</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-white/80">mức độ</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-white/80">responsive</p>
                </div>
              </div>
            </div>

            <div className="lg:justify-self-end">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/90">Gợi ý hôm nay</p>
                  <span className="text-xs rounded-full bg-white/15 px-3 py-1">Updated</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    { title: 'Lập trình Web', desc: 'HTML • CSS • JS', icon: '🌐' },
                    { title: 'React', desc: 'Hooks • Router • State', icon: '⚛️' },
                    { title: 'Data', desc: 'Python • ML • AI', icon: '📊' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-white/10 px-4 py-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.title}</p>
                        <p className="text-sm text-white/75 truncate">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="/courses"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white text-sm font-bold text-blue-700 hover:bg-white/95"
                >
                  Bắt đầu học ngay
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Danh mục khóa học</h2>
            <p className="mt-2 text-gray-600">Chọn chủ đề bạn muốn học hôm nay.</p>
          </div>
          <a href="/courses#categories" className="text-sm font-semibold text-blue-600 hover:underline">
            Xem tất cả →
          </a>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.length > 0 ? (
            categories.map((c) => (
              <a
                key={c.slug}
                href={`/courses?category=${encodeURIComponent(c.slug)}#categories`}
                className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center text-lg group-hover:bg-blue-50 transition-colors">
                    {iconForCategorySlug(c.slug)}
                  </div>
                  <span className="text-gray-300 group-hover:text-blue-300 transition-colors">→</span>
                </div>
                <p className="mt-3 font-semibold text-gray-900">{c.name || titleCaseFromSlug(c.slug)}</p>
                <p className="mt-1 text-sm text-gray-600">Khám phá khóa học trong danh mục này</p>
              </a>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
              Không tải được danh mục. Bạn vẫn có thể xem danh sách ở trang Khóa học.
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Bài viết mới</h2>
            <p className="mt-2 text-gray-600">Mẹo học hiệu quả, lộ trình và xu hướng kỹ năng.</p>
          </div>
          <a href="/courses" className="text-sm font-semibold text-blue-600 hover:underline">
            Xem khóa học →
          </a>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.length > 0 ? (
            posts.map((p) => (
              <article key={p.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
                  <img
                    src={`https://picsum.photos/seed/post-${p.id}/800/450`}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-gray-500">Bài viết</p>
                  <h3 className="mt-2 text-lg font-bold text-gray-900 line-clamp-2">
                    {titleCaseFromSlug(p.title)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {truncate(p.body, 140)}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">5 phút đọc</span>
                    <a href="/courses" className="text-sm font-semibold text-blue-600 hover:underline">
                      Đọc tiếp →
                    </a>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
              Không tải được bài viết.
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-gray-900 text-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Sẵn sàng bắt đầu?</h2>
            <p className="mt-2 text-white/80">Chọn một danh mục và học bài đầu tiên ngay hôm nay.</p>
          </div>
          <a
            href="/courses"
            className="h-12 inline-flex items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-gray-900 hover:bg-white/95"
          >
            Đi tới Khóa học
          </a>
        </div>
      </section>
    </div>
  )
}
