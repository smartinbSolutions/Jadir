"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/GlobalHooks/GlobalHooks";
import { imageURL } from "@/api/GlobalData";
import BlogImg from "../../public/assets/images/news/news-1.jpg";
import BlogImgSmall from "../../public/assets/images/news/post-3.jpg";

function getBlogImage(blog, fallback) {
  const imagePath =
    blog?.imageUrl ||
    blog?.thumbnailImageUrl ||
    blog?.image ||
    blog?.photo ||
    (Array.isArray(blog?.thumbnailImage)
      ? blog.thumbnailImage[0]
      : blog?.thumbnailImage) ||
    "";

  if (!imagePath) {
    return fallback?.src || "";
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${imageURL}${imagePath}`;
  }

  if (imagePath.startsWith("uploads/")) {
    return `${imageURL}/${imagePath}`;
  }

  return `${imageURL}/uploads/blogs/${imagePath}`;
}

// Strip HTML and limit visible words.
function trimWords(text = "", count = 10) {
  const clean = text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = clean.split(" ").filter(Boolean);

  return words.length > count ? `${words.slice(0, count).join(" ")}...` : clean;
}

export default function NewsSlider({ news = [] }) {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language || "en";
  const isRtl = currentLang === "ar";

  const categories = useMemo(() => {
    const map = new Map();

    news.forEach((item) => {
      const slug = item?.category?.slug;
      if (!slug) return;

      map.set(slug, {
        slug,
        label:
          item?.category?.name?.[currentLang] ||
          item?.category?.name?.en ||
          slug,
      });
    });

    return [
      {
        slug: "all",
        label:
          currentLang === "ar" ? "الكل" : currentLang === "tr" ? "Tümü" : "All",
      },
      ...Array.from(map.values()),
    ];
  }, [news, currentLang]);

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredNews = useMemo(() => {
    if (activeCategory === "all") return news;
    return news.filter((item) => item?.category?.slug === activeCategory);
  }, [news, activeCategory]);

  const featuredPost = filteredNews?.[0];

  const featuredAuthorName =
    typeof featuredPost?.author?.name === "string"
      ? featuredPost.author.name
      : featuredPost?.author?.name?.[currentLang] ||
        featuredPost?.author?.name?.en ||
        featuredPost?.author?.name?.ar ||
        featuredPost?.author?.name?.tr ||
        "Jadir";
  const smallPosts = filteredNews?.slice(1, 3) || [];
  const mobilePosts = filteredNews?.slice(0, 4) || [];

  if (!news?.length) return null;

  return (
    <div className={`jadwa-blog-showcase ${isRtl ? "rtl" : "ltr"}`}>
      {/* Top filters + desktop CTA */}
      <div className="jadwa-blog-filters-wrap">
        <div className="jadwa-blog-filters">
          {categories.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setActiveCategory(item.slug)}
              className={`jadwa-blog-filter ${
                activeCategory === item.slug ? "active" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="jadwa-blog-bottom-btn">
          <Link href="/blogs" className="jadwa-blog-all-btn">
            {" "}
            {currentLang === "ar"
              ? "جميع المقالات"
              : currentLang === "tr"
                ? "Tüm Yazılar"
                : "Read All Posts"}
          </Link>
        </div>
      </div>

      {!!filteredNews.length && (
        <>
          {/* Desktop Layout */}
          <div className="jadwa-blog-layout">
            {featuredPost && (
              <article className="jadwa-blog-featured-card">
                <div className="jadwa-blog-featured-content">
                  <div className="jadwa-blog-featured-top">
                    <span className="jadwa-blog-category">
                      {featuredPost?.category?.name?.[currentLang] ??
                        featuredPost?.category?.name?.en ??
                        t("General")}
                    </span>

                    <span className="jadwa-blog-meta-author">
                      {featuredAuthorName}
                    </span>
                  </div>

                  <h3 className="jadwa-blog-featured-title">
                    <Link
                      href={`/blogs/${featuredPost?.slug || featuredPost?._id}`}
                    >
                      {trimWords(
                        featuredPost?.title?.[currentLang] ||
                          featuredPost?.title?.en ||
                          "No title available",
                        9,
                      )}
                    </Link>
                  </h3>

                  <p className="jadwa-blog-featured-excerpt">
                    {trimWords(
                      featuredPost?.excerpt?.[currentLang] ||
                        featuredPost?.excerpt?.en ||
                        featuredPost?.content?.[currentLang] ||
                        featuredPost?.content?.en ||
                        "",
                      26,
                    )}
                  </p>

                  <div className="jadwa-blog-featured-footer">
                    <div className="jadwa-blog-meta">
                      <span>{formatDate(featuredPost?.createdAt)}</span>
                    </div>

                    <Link
                      href={`/blogs/${featuredPost?.slug || featuredPost?._id}`}
                      className="jadwa-blog-readmore"
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

                <div className="jadwa-blog-featured-image-wrap">
                  <img
                    src={getBlogImage(featuredPost, BlogImg)}
                    alt={
                      featuredPost?.title?.[currentLang] ||
                      featuredPost?.title?.en ||
                      "Blog"
                    }
                    className="jadwa-blog-featured-image"
                  />
                </div>
              </article>
            )}

            <div className="jadwa-blog-grid">
              {smallPosts.map((blog) => (
                <article key={blog?._id} className="jadwa-blog-card">
                  <Link
                    href={`/blogs/${blog?.slug || blog?._id}`}
                    className="jadwa-blog-card-image-link"
                  >
                    <img
                      src={getBlogImage(blog, BlogImgSmall)}
                      alt={
                        blog?.title?.[currentLang] || blog?.title?.en || "Blog"
                      }
                      className="jadwa-blog-card-image"
                    />
                  </Link>

                  <div className="jadwa-blog-card-body">
                    <div className="jadwa-blog-card-top">
                      <span className="jadwa-blog-category small">
                        {blog?.category?.name?.[currentLang] ||
                          blog?.category?.name?.en ||
                          t("General")}
                      </span>

                      <span className="jadwa-blog-date">
                        {formatDate(blog?.publishedAt || blog?.createdAt)}
                      </span>
                    </div>

                    <h4 className="jadwa-blog-card-title">
                      <Link href={`/blogs/${blog?.slug || blog?._id}`}>
                        {trimWords(
                          blog?.title?.[currentLang] ||
                            blog?.title?.en ||
                            "No title available",
                          8,
                        )}
                      </Link>
                    </h4>

                    <p className="jadwa-blog-card-excerpt">
                      {trimWords(
                        blog?.excerpt?.[currentLang] ||
                          blog?.excerpt?.en ||
                          blog?.content?.[currentLang] ||
                          blog?.content?.en ||
                          "",
                        14,
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="jadwa-blog-mobile-list">
            {mobilePosts.map((blog) => (
              <article key={blog?._id} className="jadwa-blog-mobile-row-card">
                <Link
                  href={`/blogs/${blog?.slug || blog?._id}`}
                  className="jadwa-blog-mobile-row-image-link"
                >
                  <img
                    src={getBlogImage(blog, BlogImgSmall)}
                    alt={
                      blog?.title?.[currentLang] || blog?.title?.en || "Blog"
                    }
                    className="jadwa-blog-mobile-row-image"
                  />
                </Link>

                <div className="jadwa-blog-mobile-row-body">
                  <div className="jadwa-blog-mobile-row-top">
                    <span className="jadwa-blog-category small">
                      {blog?.category?.name?.[currentLang] ||
                        blog?.category?.name?.en ||
                        t("General")}
                    </span>

                    <span className="jadwa-blog-date">
                      {formatDate(blog?.publishedAt || blog?.createdAt)}{" "}
                    </span>
                  </div>

                  <h4 className="jadwa-blog-mobile-row-title">
                    <Link href={`/blogs/${blog?.slug || blog?._id}`}>
                      {trimWords(
                        blog?.title?.[currentLang] ||
                          blog?.title?.en ||
                          "No title available",
                        8,
                      )}
                    </Link>
                  </h4>

                  <p className="jadwa-blog-mobile-row-excerpt">
                    {trimWords(
                      blog?.excerpt?.[currentLang] ||
                        blog?.excerpt?.en ||
                        blog?.content?.[currentLang] ||
                        blog?.content?.en ||
                        "",
                      10,
                    )}
                  </p>
                </div>
              </article>
            ))}

            {/* Mobile CTA below cards */}
            <div className="jadwa-blog-mobile-bottom-btn">
              <Link href="/blog-2" className="jadwa-blog-all-btn">
                {currentLang === "ar"
                  ? "جميع المقالات"
                  : currentLang === "tr"
                    ? "Tüm Yazılar"
                    : "Read All Posts"}
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Empty state after filtering */}
      {!filteredNews.length && (
        <div className="jadwa-blog-empty">
          {currentLang === "ar"
            ? "لا توجد مقالات في هذا التصنيف حالياً"
            : currentLang === "tr"
              ? "Bu kategoride şu anda yazı yok"
              : "No posts in this category right now"}
        </div>
      )}
    </div>
  );
}
