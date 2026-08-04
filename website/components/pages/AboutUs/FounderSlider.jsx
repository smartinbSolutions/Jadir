"use client";

import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

import parse from "html-react-parser";
import getImageUrl from "@/components/utils/getImageUrl";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

export default function FounderSlider({ founders = [], variant = "founders" }) {
  const { i18n, t } = useTranslation();

  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  const isRtl = lang === "ar";

  const items = Array.isArray(founders) ? founders : [];

  const canNavigate = items.length > 1;

  const sliderKey = String(variant || "founders")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  const previousClass = `jadwa-founder-prev-${sliderKey}`;

  const nextClass = `jadwa-founder-next-${sliderKey}`;

  const paginationClass = `jadwa-founder-pagination-${sliderKey}`;

  if (!items.length) {
    return null;
  }

  return (
    <div
      className={`jadwa-founder-slider-wrap jadwa-founder-slider-${sliderKey} ${
        isRtl ? "rtl" : "ltr"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Swiper
        key={`${sliderKey}-${lang}-${isRtl ? "rtl" : "ltr"}`}
        dir={isRtl ? "rtl" : "ltr"}
        modules={[Navigation, Pagination, Autoplay]}
        centeredSlides
        loop={canNavigate}
        speed={700}
        observer
        observeParents
        updateOnWindowResize
        breakpoints={{
          0: {
            slidesPerView: 1.5,
            spaceBetween: 12,
          },

          768: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
        }}
        autoplay={
          canNavigate
            ? {
                delay: 70000,
                disableOnInteraction: false,
              }
            : false
        }
        navigation={
          canNavigate
            ? {
                nextEl: `.${nextClass}`,
                prevEl: `.${previousClass}`,
              }
            : false
        }
        pagination={
          canNavigate
            ? {
                el: `.${paginationClass}`,
                clickable: true,
              }
            : false
        }
        className="jadwa-founder-swiper"
      >
        {items.map((member, index) => {
          const name = getLocalizedText(member?.name, lang, "Team Member");

          const position = getLocalizedText(member?.position, lang, "");

          const bio = getLocalizedText(member?.bio, lang, "");

          const memberImage = member?.imageUrl
            ? getImageUrl(member.imageUrl)
            : "";

          return (
            <SwiperSlide key={member?._id || member?.id || index}>
              <article className="jadwa-founder-slide">
                <div className="jadwa-founder-pattern" />

                <div className="jadwa-founder-grid">
                  <div className="jadwa-founder-media">
                    <div className="jadwa-founder-image-box">
                      {memberImage ? (
                        <img
                          src={memberImage}
                          alt={name}
                          className="jadwa-founder-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="jadwa-founder-image-fallback">
                          {getInitials(name)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="jadwa-founder-content">
                    <div className="jadwa-founder-top">
                      <div className="jadwa-pill jadwa-founder-pill">
                        <span className="jadwa-pill-dot" />

                        <span>
                          {variant === "founders" ? t("founder") : t("team")}
                        </span>
                      </div>

                      <span className="jadwa-founder-counter">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="jadwa-founder-name">{name}</h3>

                    {position ? (
                      <div className="jadwa-founder-position">{position}</div>
                    ) : null}

                    {bio ? (
                      <div className="jadwa-founder-bio">{parse(bio)}</div>
                    ) : null}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {canNavigate ? (
        <div className="jadwa-founder-controls">
          <button
            className={`jadwa-founder-nav jadwa-founder-prev ${previousClass}`}
            type="button"
            aria-label="Previous member"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </button>

          <div className={`jadwa-founder-pagination ${paginationClass}`} />

          <button
            className={`jadwa-founder-nav jadwa-founder-next ${nextClass}`}
            type="button"
            aria-label="Next member"
          >
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
