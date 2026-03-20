'use client';

import { useState, useEffect } from 'react';
import CourseCard from '@/components/CourseCard';
import Categories from '@/components/Categories';
import { fetchCoursesFromJsonPlaceholder } from '@/utils/mockCourseData';
import { Course } from '@/types/course';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryItem } from '@/components/Categories';

const PAGE_SIZE = 9;

function titleCase(input: string) {
  return input
    .split(/[\s-]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function iconForCategorySlug(slug: string) {
  if (slug === 'all') return '📚';
  if (/(phone|smartphone|mobile)/i.test(slug)) return '📱';
  if (/(laptop|computer|pc)/i.test(slug)) return '💻';
  if (/(beauty|skin|fragrance)/i.test(slug)) return '🧴';
  if (/(furniture|home|kitchen)/i.test(slug)) return '🏠';
  if (/(grocer|food)/i.test(slug)) return '🛒';
  if (/(sports)/i.test(slug)) return '🏅';
  return '🏷️';
}

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | Course['level']>('All');
  const [page, setPage] = useState(1);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([
    { id: 'all', name: 'Tất cả', count: 0, icon: '📚' },
  ]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const pageFromUrl = Number(searchParams.get('page') || '1');
    const qFromUrl = searchParams.get('q') || '';
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
    if (!categoryFromUrl && selectedCategory !== 'all') {
      setSelectedCategory('all');
    }
    if (!Number.isNaN(pageFromUrl) && pageFromUrl >= 1 && pageFromUrl !== page) {
      setPage(pageFromUrl);
    }
    if (qFromUrl !== search) {
      setSearch(qFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCoursesFromJsonPlaceholder()
      .then((courses) => {
        if (cancelled) return;
        setAllCourses(courses);

        const counts = new Map<string, number>();
        for (const c of courses) {
          const slug = c.type.toLowerCase().replace(/\s+/g, '-');
          counts.set(slug, (counts.get(slug) ?? 0) + 1);
        }

        const items: CategoryItem[] = [
          { id: 'all', name: 'Tất cả', count: courses.length, icon: '📚' },
          ...Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([slug, count]) => ({
              id: slug,
              name: titleCase(slug),
              count,
              icon: iconForCategorySlug(slug),
            })),
        ];
        setCategoryItems(items);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu khóa học');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = allCourses
      .filter((course) => {
        if (!normalizedSearch) return true;
        return course.title.toLowerCase().includes(normalizedSearch);
      })
      .filter((course) => {
        if (levelFilter === 'All') return true;
        return course.level === levelFilter;
      })
      .filter((course) => {
        if (selectedCategory === 'all') return true;
        const courseType = course.type.toLowerCase().replace(/\s+/g, '-');
        return courseType === selectedCategory;
      });

    setFilteredCourses(filtered);
  }, [selectedCategory, allCourses, search, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleCourses = filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage]);

  useEffect(() => {
    // Khi đổi search/filter thì reset về trang 1
    if (page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, levelFilter, selectedCategory]);

  const updateUrl = (next: { category?: string; page?: number; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextCategory = next.category ?? selectedCategory;
    const nextPage = next.page ?? page;
    const nextQ = next.q ?? search;

    if (nextCategory === 'all') params.delete('category');
    else params.set('category', nextCategory);

    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));

    if (!nextQ.trim()) params.delete('q');
    else params.set('q', nextQ);

    const qs = params.toString();
    router.replace(qs ? `/courses?${qs}#categories` : '/courses#categories');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateUrl({ category, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Khóa Học Nổi Bật
            </h1>
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
            <Categories
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categories={categoryItems}
            />
          </div>

          {/* Main Content - Courses */}
          <div className="lg:col-span-3">
            {/* Search & Filter */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <span className="text-gray-400">🔎</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => updateUrl({ q: search, page: 1 })}
                    placeholder="Tìm kiếm theo tên khóa học..."
                    className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Độ khó</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as 'All' | Course['level'])}
                  className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm"
                >
                  <option value="All">Tất cả</option>
                  <option value="S">S</option>
                  <option value="Pres">Pres</option>
                  <option value="TC">TC</option>
                  <option value="MTC">MTC</option>
                </select>
              </div>
            </div>

            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">{filteredCourses.length}</span> khóa học
                  {selectedCategory !== 'all' && (
                    <span className="ml-1">
                      trong danh mục <span className="font-medium capitalize">
                        {selectedCategory.replace('-', ' ')}
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-20"></div>
                  <div className="relative inline-block">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-purple-600"></div>
                  </div>
                </div>
                <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải khóa học...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tải dữ liệu thất bại
                </h3>
                <p className="text-gray-600 mb-6">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {visibleCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <span className="text-2xl">📭</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Không có kết quả
                    </h3>
                    <p className="text-gray-600">
                      Không có kết quả phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc.
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {filteredCourses.length > 0 ? (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-gray-600">
                      Trang <span className="font-semibold text-gray-900">{safePage}</span> / {totalPages} (tối đa {PAGE_SIZE} khóa học/trang)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => {
                          const nextPage = Math.max(1, safePage - 1);
                          setPage(nextPage);
                          updateUrl({ page: nextPage });
                        }}
                        className="h-11 min-w-[44px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                      >
                        ← Trước
                      </button>

                      <div className="hidden sm:flex items-center gap-2">
                        {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
                          const p = idx + 1;
                          const active = p === safePage;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setPage(p);
                                updateUrl({ page: p });
                              }}
                              className={`h-11 min-w-[44px] rounded-xl px-3 text-sm font-semibold transition ${
                                active
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                        {totalPages > 7 ? <span className="px-2 text-gray-500">…</span> : null}
                      </div>

                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => {
                          const nextPage = Math.min(totalPages, safePage + 1);
                          setPage(nextPage);
                          updateUrl({ page: nextPage });
                        }}
                        className="h-11 min-w-[44px] rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
