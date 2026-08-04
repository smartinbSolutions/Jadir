"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Swiper, SwiperSlide } from "swiper/react";

import { Pagination, Autoplay, Navigation } from "swiper/modules";

import getImageUrl from "@/components/utils/getImageUrl";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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

const getInitials = (name = "") => {
  if (typeof name !== "string") {
    return "";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const getTestimonialImage = (testimonial) => {
  const imagePath =
    testimonial?.imageUrl ||
    testimonial?.avatarUrl ||
    testimonial?.image ||
    testimonial?.avatar ||
    "";

  const normalizedPath = Array.isArray(imagePath) ? imagePath[0] : imagePath;

  if (!normalizedPath || typeof normalizedPath !== "string") {
    return "";
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

  return getImageUrl(`/uploads/testimonials/${normalizedPath}`);
};

export default function TestimonialsShowcase({ testimonials = [] }) {
  const { i18n, t } = useTranslation();

  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  const isRtl = lang === "ar";

  const sortedTestimonials = useMemo(() => {
    const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];

    return [...safeTestimonials].sort((a, b) => {
      const aDate = new Date(a?.createdAt || 0).getTime();

      const bDate = new Date(b?.createdAt || 0).getTime();

      return bDate - aDate;
    });
  }, [testimonials]);

  if (!sortedTestimonials.length) {
    return null;
  }

  const canNavigate = sortedTestimonials.length > 1;

  const canLoop = sortedTestimonials.length > 3;

  const sectionLabel = getLocalizedText(
    t("about.testimonials"),
    lang,
    "Testimonials",
  );

  const sectionTitle = getLocalizedText(
    t("trustedAmbitious"),
    lang,
    "Trusted by ambitious businesses",
  );

  const sectionSubtitle = getLocalizedText(t("usedByFounders"), lang, "");

  return (
    <section
      className={`pt-5 jadwa-testimonials sec-pad ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="auto-container">
        <div className="jadwa-testimonials-panel">
          <div className="jadwa-testimonials-head">
            <div className="jadwa-pill">
              <span className="jadwa-pill-dot" />

              <span>{sectionLabel}</span>
            </div>

            <h2 className="jadwa-testimonials-title">{sectionTitle}</h2>

            {sectionSubtitle ? (
              <p className="jadwa-testimonials-subtitle">{sectionSubtitle}</p>
            ) : null}
          </div>

          <div className="jadwa-featured-swiper-wrap">
            {canNavigate ? (
              <>
                <button
                  type="button"
                  className="jadwa-featured-nav jadwa-featured-left"
                  aria-label="Previous testimonial"
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="jadwa-featured-nav jadwa-featured-right"
                  aria-label="Next testimonial"
                >
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
              </>
            ) : null}

            <Swiper
              key={`${lang}-${isRtl ? "rtl" : "ltr"}`}
              modules={[Pagination, Autoplay, Navigation]}
              navigation={
                canNavigate
                  ? {
                      prevEl: isRtl
                        ? ".jadwa-featured-right"
                        : ".jadwa-featured-left",

                      nextEl: isRtl
                        ? ".jadwa-featured-left"
                        : ".jadwa-featured-right",
                    }
                  : false
              }
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                768: {
                  slidesPerView: 2,
                },

                1200: {
                  slidesPerView: 3,
                },
              }}
              pagination={{
                clickable: true,
              }}
              watchOverflow
              loop={canLoop}
              rewind={canNavigate && !canLoop}
              autoplay={
                canNavigate
                  ? {
                      delay: 5000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              dir={isRtl ? "rtl" : "ltr"}
              className="jadwa-featured-swiper"
            >
              {sortedTestimonials.map((item, index) => {
                const content = getLocalizedText(item?.content, lang, "");

                const name = getLocalizedText(item?.name, lang, "Client");

                const role = getLocalizedText(item?.role, lang, "");

                const avatarSrc = getTestimonialImage(item);

                const rating = Math.max(
                  1,
                  Math.min(Number(item?.rating || 5), 5),
                );

                return (
                  <SwiperSlide key={item?._id || item?.id || index}>
                    <article className="jadwa-featured-card">
                      <div className="jadwa-quote-light">&quot;</div>

                      {content ? (
                        <p className="jadwa-featured-text">{content}</p>
                      ) : null}

                      <div className="jadwa-stars">
                        {Array.from({
                          length: rating,
                        }).map((_, starIndex) => (
                          <i
                            key={starIndex}
                            className="fa-solid fa-star"
                            aria-hidden="true"
                          />
                        ))}
                      </div>

                      <div className="jadwa-user">
                        <div className="jadwa-avatar jadwa-avatar-dark">
                          {avatarSrc ? (
                            <img src={avatarSrc} alt={name} loading="lazy" />
                          ) : (
                            getInitials(name)
                          )}
                        </div>

                        <div className="jadwa-user-meta">
                          <h4>{name}</h4>

                          {role ? <p>{role}</p> : null}
                        </div>
                      </div>
                    </article>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
