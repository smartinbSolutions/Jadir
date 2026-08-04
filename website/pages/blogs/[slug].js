"use client";

import Layout from "@/components/layout/Layout";
import Link from "next/link";
import parse from "html-react-parser";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/GlobalHooks/GlobalHooks";
import { imageURL } from "@/api/GlobalData";

import { getPageBanners, resolvePageBanner } from "@/lib/pageBanners";
import {
  getAllBlogs,
  getBlogBySlug,
  getRelatedBlogs,
} from "@/api/getOtherData";
import ShareArticle from "@/components/elements/ShareArticle";
import getImageUrl from "@/components/utils/getImageUrl";

const getLocalizedText = (value, lang = "en", fallback = "") => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const localizedValue = value[lang] ?? value.en ?? value.ar ?? value.tr;

  if (
    typeof localizedValue === "string" ||
    typeof localizedValue === "number"
  ) {
    return String(localizedValue);
  }

  return fallback;
};

const getCategoryLabel = (category, lang) => {
  return getLocalizedText(category?.name ?? category?.title, lang, "");
};

const FALLBACK_BLOG_IMAGE = "/assets/images/news/news-5.jpg";

const getBlogImage = (blog, useThumbnail = false) => {
  const imagePath = useThumbnail
    ? blog?.thumbnailImageUrl ||
      blog?.imageUrl ||
      blog?.thumbnailImage ||
      blog?.image ||
      blog?.photo
    : blog?.imageUrl ||
      blog?.thumbnailImageUrl ||
      blog?.image ||
      blog?.photo ||
      blog?.thumbnailImage;

  const normalizedPath = Array.isArray(imagePath) ? imagePath[0] : imagePath;

  if (!normalizedPath || typeof normalizedPath !== "string") {
    return FALLBACK_BLOG_IMAGE;
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("/")) {
    return getImageUrl(normalizedPath);
  }

  if (normalizedPath.startsWith("uploads/")) {
    return getImageUrl(`/${normalizedPath}`);
  }

  return getImageUrl(`/uploads/blogs/${normalizedPath}`);
};
export default function BlogDetailsPage({
  blog,
  relatedBlogs = [],
  pageBanners = {},
}) {
  const { i18n, t } = useTranslation();

  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  const isRtl = lang === "ar";

  if (!blog) {
    return null;
  }

  const blogTitle = getLocalizedText(blog?.title, lang, "");

  const blogContent = getLocalizedText(blog?.content, lang, "");

  const blogExcerpt = getLocalizedText(blog?.excerpt, lang, "");

  const authorName = getLocalizedText(
    blog?.author?.name,
    lang,
    "Jadir Investment",
  );

  const authorRole = getLocalizedText(blog?.author?.role, lang, "");

  const safeRelatedBlogs = Array.isArray(relatedBlogs) ? relatedBlogs : [];

  return (
    <Layout
      breadcrumbTitle={t("blog.BlogDetails")}
      image={resolvePageBanner("blogs", pageBanners)}
    >
      {" "}
      <section
        className="jadwa-blog-details-page sec-pad"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="auto-container">
          <div className="jadwa-blog-details-hero">
            <div className="jadwa-blog-details-hero-inner">
              {blog?.category ? (
                <Link
                  href={`/blogs?category=${blog.category?._id || ""}`}
                  className="jadwa-blog-details-category"
                >
                  {getCategoryLabel(blog.category, lang)}
                </Link>
              ) : null}

              <h1 className="jadwa-blog-details-title">{blogTitle}</h1>

              <div className="jadwa-blog-details-meta">
                <span>{formatDate(blog?.createdAt)}</span>

                {(authorName || authorRole) && (
                  <>
                    <span className="jadwa-blog-details-meta-dot" />

                    <span>
                      {authorName}

                      {authorRole ? (
                        <em className="jadwa-blog-details-author-role">
                          {" "}
                          · {authorRole}
                        </em>
                      ) : null}
                    </span>
                  </>
                )}
              </div>

              {blogExcerpt ? (
                <p
                  className="jadwa-blog-details-excerpt"
                  dangerouslySetInnerHTML={{
                    __html: blogExcerpt,
                  }}
                />
              ) : null}
            </div>

            <div className="jadwa-blog-details-image-wrap">
              <img
                src={getBlogImage(blog)}
                className="jadwa-blog-details-image"
                alt={blogTitle || "Blog"}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_BLOG_IMAGE;
                }}
              />
            </div>
          </div>

          <div className="jadwa-blog-details-layout">
            <div className="jadwa-blog-details-main">
              <article className="jadwa-blog-details-article">
                <div className="jadwa-blog-details-content">
                  {blogContent ? parse(blogContent) : null}
                </div>
              </article>
            </div>

            <aside className="jadwa-blog-details-side">
              <div className="jadwa-blog-details-side-inner">
                {blog?.category ? (
                  <div className="jadwa-blog-side-card">
                    <div className="jadwa-blog-side-card-title">
                      {t("category")}
                    </div>

                    <div className="jadwa-blog-side-tags">
                      <Link
                        href={`/blogs?category=${blog.category?._id || ""}`}
                      >
                        {getCategoryLabel(blog.category, lang)}
                      </Link>
                    </div>
                  </div>
                ) : null}

                <div className="jadwa-blog-side-card">
                  <div className="jadwa-blog-side-card-title">
                    {lang === "ar"
                      ? "شارك المقال"
                      : lang === "tr"
                        ? "Yazıyı paylaş"
                        : "Share Article"}
                  </div>

                  <ShareArticle title={blogTitle} description={blogExcerpt} />
                </div>

                {safeRelatedBlogs.length ? (
                  <div className="jadwa-blog-side-card">
                    <div className="jadwa-blog-side-card-title">
                      {t("relatedBlogs")}
                    </div>

                    <div className="jadwa-blog-side-list">
                      {safeRelatedBlogs.map((item, index) => {
                        const itemTitle = getLocalizedText(
                          item?.title,
                          lang,
                          "Blog",
                        );

                        return (
                          <Link
                            key={item?._id || item?.slug || index}
                            href={`/blogs/${item?.slug || item?._id}`}
                            className="jadwa-blog-side-post"
                          >
                            <div className="jadwa-blog-side-post-image-wrap">
                              <img
                                src={getBlogImage(item, true)}
                                alt={itemTitle}
                                className="jadwa-blog-side-post-image"
                              />
                            </div>

                            <div className="jadwa-blog-side-post-content">
                              <h5>{itemTitle}</h5>

                              <span>{formatDate(item?.createdAt)}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>

          {safeRelatedBlogs.length ? (
            <div className="jadwa-blog-details-related">
              <div className="jadwa-testimonials-head jadwa-blog-related-head">
                <div className="jadwa-pill">
                  <span className="jadwa-pill-dot" />

                  <span>
                    {t("blog.RelatedBlogs") === "blog.RelatedBlogs"
                      ? "More From The Blog"
                      : t("blog.RelatedBlogs")}
                  </span>
                </div>

                <h2 className="jadwa-testimonials-title">
                  {t("blog.RelatedArticles") === "blog.RelatedArticles"
                    ? "Related Articles"
                    : t("blog.RelatedArticles")}
                </h2>
              </div>

              <div className="row clearfix">
                {safeRelatedBlogs.map((item, index) => {
                  const itemTitle = getLocalizedText(item?.title, lang, "Blog");

                  const itemAuthorName = getLocalizedText(
                    item?.author?.name,
                    lang,
                    "Jadir Investment",
                  );

                  return (
                    <div
                      key={item?._id || item?.slug || index}
                      className="col-lg-4 col-md-6 col-sm-12 mb-4"
                    >
                      <article className="jadwa-blog-card-v2">
                        <Link
                          href={`/blogs/${item?.slug || item?._id}`}
                          className="jadwa-blog-card-v2-image-link"
                        >
                          <img
                            src={getBlogImage(item)}
                            alt={itemTitle}
                            className="jadwa-blog-card-v2-image"
                          />
                        </Link>

                        <div className="jadwa-blog-card-v2-content">
                          <div className="jadwa-blog-card-v2-top">
                            {item?.category ? (
                              <span className="jadwa-blog-card-v2-category">
                                {getCategoryLabel(item.category, lang)}
                              </span>
                            ) : null}

                            <span className="jadwa-blog-card-v2-date">
                              {formatDate(item?.createdAt)}
                            </span>
                          </div>

                          <h3 className="jadwa-blog-card-v2-title">
                            <Link href={`/blogs/${item?.slug || item?._id}`}>
                              {itemTitle}
                            </Link>
                          </h3>

                          <div className="jadwa-blog-card-v2-footer">
                            <span className="jadwa-blog-card-v2-author">
                              {itemAuthorName}
                            </span>

                            <Link
                              href={`/blogs/${item?.slug || item?._id}`}
                              className="jadwa-blog-card-v2-link"
                            >
                              <span>{t("ExploreMore")}</span>

                              <i
                                className={`fa-solid ${
                                  isRtl ? "fa-arrow-left" : "fa-arrow-right"
                                }`}
                                aria-hidden="true"
                              />
                            </Link>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticPaths() {
  try {
    const payload = await getAllBlogs({
      page: 1,
      limit: 100,
    });

    const blogs = Array.isArray(payload?.data) ? payload.data : [];

    return {
      paths: blogs
        .filter((blog) => blog?.slug)
        .map((blog) => ({
          params: {
            slug: blog.slug,
          },
        })),
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Failed to generate blog paths:", error);

    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const [blog, pageBanners] = await Promise.all([
      getBlogBySlug(params?.slug),
      getPageBanners(),
    ]);

    if (!blog?._id && !blog?.slug) {
      return {
        notFound: true,
        revalidate: 60,
      };
    }

    const relatedBlogs = await getRelatedBlogs({
      blog,
      limit: 4,
    });

    return {
      props: {
        blog,

        relatedBlogs: Array.isArray(relatedBlogs) ? relatedBlogs : [],

        pageBanners: pageBanners || {},
      },

      revalidate: 300,
    };
  } catch (error) {
    console.error("Failed to fetch blog details:", error);

    return {
      notFound: true,
      revalidate: 60,
    };
  }
}
