"use client";
import Layout from "@/components/layout/Layout";
import { formatDate, truncateText } from "@/GlobalHooks/GlobalHooks";
import Link from "next/link";
import Pagination from "@/GlobalComponents/Pagination";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { getAllBlogs, getAllCategories } from "@/api/getOtherData";
import getImageUrl from "@/components/utils/getImageUrl";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination as SwiperPagination,
  Autoplay,
} from "swiper/modules";
import { getPageBanners, resolvePageBanner } from "@/lib/pageBanners";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { stripHtml, truncateStripText } from "@/components/utils/helpers";
import { useIsMobile } from "@/lib/helpers";

const BLOGS_PER_PAGE = 9;

const getLocalizedValue = (value, lang, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }

  return value?.[lang] || value?.en || value?.ar || value?.tr || fallback;
};
const getCategoryLabel = (category, lang) =>
  category?.name?.[lang] ||
  category?.name?.en ||
  category?.title?.[lang] ||
  category?.title?.en ||
  "";

const FALLBACK_BLOG_IMAGE = "/assets/images/news/news-5.jpg";

const getBlogImage = (blog, useThumbnail = false) => {
  const path = useThumbnail
    ? blog?.thumbnailImageUrl || blog?.imageUrl
    : blog?.imageUrl || blog?.thumbnailImageUrl;

  return path ? getImageUrl(path) : FALLBACK_BLOG_IMAGE;
};

export default function BlogPage({
  initialBlogs,
  initialCategories,
  pageBanners = {},
}) {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const isRtl = currentLang === "ar";
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [blogs, setBlogs] = useState(initialBlogs);
  const [isLoading, setIsLoading] = useState(false);

  const categories = useMemo(
    () => initialCategories?.data || [],
    [initialCategories],
  );

  useEffect(() => {
    if (!router.isReady) return;

    const queryPage = Number.parseInt(router.query.page, 10);
    const nextPage =
      Number.isFinite(queryPage) && queryPage > 0 ? queryPage : 1;
    const nextCategory =
      typeof router.query.category === "string" ? router.query.category : "";
    const nextKeyword =
      typeof router.query.keyword === "string" ? router.query.keyword : "";

    setCurrentPage(nextPage);
    setCategoryId(nextCategory);
    setSearchInput(nextKeyword);
    setKeyword(nextKeyword);
  }, [
    router.isReady,
    router.query.page,
    router.query.category,
    router.query.keyword,
  ]);

  useEffect(() => {
    if (!router.isReady) return;

    const nextQuery = {};
    if (currentPage > 1) nextQuery.page = String(currentPage);
    if (categoryId) nextQuery.category = categoryId;
    if (keyword) nextQuery.keyword = keyword;

    const currentQuery = {
      page:
        typeof router.query.page === "string" ? router.query.page : undefined,
      category:
        typeof router.query.category === "string"
          ? router.query.category
          : undefined,
      keyword:
        typeof router.query.keyword === "string"
          ? router.query.keyword
          : undefined,
    };

    const hasChanged =
      currentQuery.page !== nextQuery.page ||
      currentQuery.category !== nextQuery.category ||
      currentQuery.keyword !== nextQuery.keyword;

    if (hasChanged) {
      router.replace(
        {
          pathname: "/blogs",
          query: nextQuery,
        },
        undefined,
        { shallow: true },
      );
    }
  }, [router, router.isReady, currentPage, categoryId, keyword]);

  useEffect(() => {
    let active = true;

    async function loadBlogs() {
      setIsLoading(true);

      try {
        const data = await getAllBlogs({
          page: currentPage,
          limit: BLOGS_PER_PAGE,
          CategoryId: categoryId,
          keyword,
        });

        if (active) setBlogs(data);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadBlogs();

    return () => {
      active = false;
    };
  }, [currentPage, categoryId, keyword]);

  const totalPages = blogs?.pagination?.totalPages ?? 0;
  const totalItems = blogs?.pagination?.totalItems ?? blogs?.data?.length ?? 0;
  const blogItems = blogs?.data || [];

  console.log("BLOG DATA:", blogItems[0]);
  console.log("GENERATED IMAGE URL:", getBlogImage(blogItems[0], true));

  const featuredBlogs = blogItems.slice(0, 3);

  const gridBlogs = blogItems;

  const handleCategoryChange = (nextCategoryId = "") => {
    setCategoryId(nextCategoryId);
    setCurrentPage(1);
  };

  return (
    <Layout
      breadcrumbTitle={t("blog.Blogs")}
      image={resolvePageBanner("blogs", pageBanners)}
    >
      <section className="jadwa-blog-page sec-pad">
        <div className="auto-container">
          <div className="jadwa-testimonials-head jadwa-blog-page-head">
            <div className="jadwa-pill">
              <span className="jadwa-pill-dot" />
              <span>
                {currentLang === "ar"
                  ? "الاخبار"
                  : currentLang === "tr"
                    ? "Blog"
                    : "Blog"}
              </span>
            </div>

            <h2 className="jadwa-testimonials-title">
              {currentLang === "ar"
                ? "تصفح مدوناتنا وأخبارنا"
                : currentLang === "tr"
                  ? "Bloglarımıza ve haberlerimize göz atın"
                  : "Browse our blogs and news"}
            </h2>

            <p className="jadwa-testimonials-subtitle">
              {currentLang === "ar"
                ? "تحليلات ومقالات ورؤى تساعدك على متابعة الأسواق والفرص والقرارات الاستثمارية."
                : currentLang === "tr"
                  ? "Piyasalar, fırsatlar ve yatırım kararları hakkında analizler, makaleler ve içgörüler."
                  : "Insights, articles, and market perspectives to help you follow opportunities and make informed decisions."}
            </p>
          </div>
          <div className="jadwa-blog-toolbar">
            <div className="jadwa-blog-categories">
              <button
                type="button"
                onClick={() => handleCategoryChange("")}
                className={`jadwa-blog-category-pill ${
                  !categoryId ? "active" : ""
                }`}
              >
                {t("All")}
              </button>

              {categories?.slice(0, 4).map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleCategoryChange(item._id)}
                  className={`jadwa-blog-category-pill ${
                    categoryId === item._id ? "active" : ""
                  }`}
                >
                  {getCategoryLabel(item, currentLang)}
                </button>
              ))}
              {categories?.length > 4 && (
                <select
                  className="jadwa-blog-category-pill"
                  value={
                    categories.slice(0, 4).some((c) => c._id === categoryId)
                      ? ""
                      : categoryId || ""
                  }
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">{t("more")}</option>
                  {categories.slice(4).map((cat) => (
                    <option key={cat?._id} value={cat?._id}>
                      {getCategoryLabel(cat, currentLang)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <form
              className="jadwa-blog-search"
              onSubmit={(e) => {
                e.preventDefault();
                setKeyword(searchInput.trim());
                setCurrentPage(1);
              }}
            >
              <input
                type="search"
                placeholder={
                  currentLang === "ar"
                    ? "ابحث في المقالات..."
                    : currentLang === "tr"
                      ? "Yazılarda ara..."
                      : "Search blog..."
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                type="submit"
                aria-label="Search"
                className="jadwa-blog-search-btn"
              >
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </form>
          </div>
          {!!featuredBlogs.length && (
            <div className="jadwa-blog-hero-wrap">
              <Swiper
                key={i18n.dir()}
                dir={i18n.dir()}
                modules={[Navigation, SwiperPagination, Autoplay]}
                slidesPerView={1}
                spaceBetween={18}
                loop={featuredBlogs.length > 1}
                speed={700}
                autoplay={{
                  delay: 100000,
                  disableOnInteraction: false,
                }}
                navigation={{
                  nextEl: ".jadwa-blog-hero-next",
                  prevEl: ".jadwa-blog-hero-prev",
                }}
                pagination={{
                  el: ".jadwa-blog-hero-pagination",
                  clickable: true,
                }}
                className="jadwa-blog-hero-swiper"
              >
                {featuredBlogs.map((blog) => (
                  <SwiperSlide key={blog?._id || blog?.slug}>
                    <article className="jadwa-blog-hero-card">
                      <div className="jadwa-blog-hero-image-wrap">
                        {/* Hero: main image */}
                        <img
                          src={getBlogImage(blog)}
                          alt={
                            blog?.title?.[currentLang] ||
                            blog?.title?.en ||
                            "Blog"
                          }
                          className="jadwa-blog-hero-image"
                        />
                        <div className="jadwa-blog-hero-overlay" />
                      </div>

                      <div className="jadwa-blog-hero-content">
                        <div className="big-blog-top-content">
                          {blog?.category ? (
                            <span className="jadwa-blog-hero-category">
                              {getCategoryLabel(blog.category, currentLang)}
                            </span>
                          ) : null}

                          <h3 className="jadwa-blog-hero-title">
                            <Link href={`/blogs/${blog?.slug || blog?._id}`}>
                              {truncateText(
                                blog?.title?.[currentLang] || blog?.title?.en,
                                70,
                              ) || "There is no title"}
                            </Link>
                          </h3>

                          {!isMobile && (
                            <p className="jadwa-blog-hero-excerpt">
                              {stripHtml(
                                truncateText(
                                  blog?.excerpt?.[currentLang] ||
                                    blog?.excerpt?.en ||
                                    "",
                                  130,
                                ),
                              )}
                            </p>
                          )}
                        </div>

                        <div className="big-blog-bottom-content">
                          <div className="jadwa-blog-hero-meta">
                            <span>
                              {getLocalizedValue(
                                blog?.author?.name,
                                currentLang,
                                "Jadir Investment",
                              )}{" "}
                            </span>
                            <span className="jadwa-blog-meta-dot" />
                            <span>
                              {formatDate(
                                blog?.publishedAt || blog?.createdAt,
                              )}{" "}
                            </span>
                          </div>

                          <Link
                            href={`/blogs/${blog?.slug || blog?._id}`}
                            className="jadwa-blog-hero-link"
                          >
                            <span>{t("ExploreMore")}</span>
                            <i
                              className={`fa-solid ${
                                isRtl ? "fa-arrow-left" : "fa-arrow-right"
                              }`}
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                className="jadwa-blog-hero-nav jadwa-blog-hero-prev"
                type="button"
              >
                <i className="fa-solid fa-arrow-left" />
              </button>

              <button
                className="jadwa-blog-hero-nav jadwa-blog-hero-next"
                type="button"
              >
                <i className="fa-solid fa-arrow-right" />
              </button>

              <div className="jadwa-blog-hero-pagination" />
            </div>
          )}

          <div className="jadwa-blog-grid-wrap">
            {isLoading ? (
              <p className="jadwa-blog-empty-state">
                {t("loading") === "loading" ? "Loading..." : t("loading")}
              </p>
            ) : null}

            {!isLoading && gridBlogs.length > 0 ? (
              <div className="row clearfix">
                {gridBlogs.map((blog) => (
                  <div
                    key={blog?._id || blog?.slug}
                    className="col-lg-4 col-md-6 col-sm-12 mb-4"
                  >
                    <article className="jadwa-blog-card-v2">
                      <Link
                        href={`/blogs/${blog?.slug || blog?._id}`}
                        className="jadwa-blog-card-v2-image-link"
                      >
                        <img
                          src={getBlogImage(blog)}
                          alt={
                            blog?.title?.[currentLang] ||
                            blog?.title?.en ||
                            "Blog"
                          }
                          className="jadwa-blog-card-v2-image"
                        />
                      </Link>

                      <div className="jadwa-blog-card-v2-content">
                        <div className="jadwa-blog-card-v2-top">
                          {blog?.category ? (
                            <span className="jadwa-blog-card-v2-category">
                              {getCategoryLabel(blog.category, currentLang)}
                            </span>
                          ) : null}

                          <span className="jadwa-blog-card-v2-date">
                            {formatDate(
                              blog?.publishedAt || blog?.createdAt,
                            )}{" "}
                          </span>
                        </div>

                        <h3 className="jadwa-blog-card-v2-title">
                          <Link href={`/blogs/${blog?.slug || blog?._id}`}>
                            {truncateText(
                              blog?.title?.[currentLang] || blog?.title?.en,
                              52,
                            ) || "There is no title"}
                          </Link>
                        </h3>

                        <p className="jadwa-blog-card-v2-excerpt">
                          {truncateStripText(
                            blog?.content?.[currentLang] ||
                              blog?.content?.en ||
                              "",
                            90,
                          )}
                        </p>

                        <div className="jadwa-blog-card-v2-footer">
                          <span className="jadwa-blog-card-v2-author">
                            {getLocalizedValue(
                              blog?.author?.name,
                              currentLang,
                              "Jadir Investment",
                            )}{" "}
                          </span>

                          <Link
                            href={`/blogs/${blog?.slug || blog?._id}`}
                            className="jadwa-blog-card-v2-link"
                          >
                            <span>{t("ExploreMore")}</span>
                            <i
                              className={`fa-solid ${
                                isRtl ? "fa-arrow-left" : "fa-arrow-right"
                              }`}
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            ) : null}

            {!isLoading && !blogItems.length ? (
              <p className="jadwa-blog-empty-state">
                {keyword || categoryId
                  ? "No blogs match the current filters."
                  : "There are no blogs available yet."}
              </p>
            ) : null}

            {!isLoading && totalItems > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            ) : null}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const [blogs, categories, pageBanners] = await Promise.all([
    getAllBlogs({ page: 1, limit: BLOGS_PER_PAGE }),
    getAllCategories(),
    getPageBanners(),
  ]);

  return {
    props: {
      initialBlogs: blogs,
      initialCategories: categories,
      pageBanners,
    },
    revalidate: 60,
  };
}
