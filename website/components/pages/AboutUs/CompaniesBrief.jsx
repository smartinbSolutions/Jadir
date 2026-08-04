"use client";

import Link from "next/link";
import parse from "html-react-parser";
import { useTranslation } from "react-i18next";
import { getCountryNameByCode } from "@/lib/helpers";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
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

const getCompanyLogo = (company) => {
  if (company?.imageUrl) {
    return getImageUrl(company.imageUrl);
  }

  // دعم البيانات القديمة مؤقتًا
  if (company?.logo) {
    return getImageUrl(`/uploads/companies/${company.logo}`);
  }

  return "";
};

const getCompanyBackground = (company) => {
  if (company?.backgroundImageUrl) {
    return getImageUrl(company.backgroundImageUrl);
  }

  // دعم البيانات القديمة مؤقتًا
  if (company?.background) {
    return getImageUrl(`/uploads/companies/${company.background}`);
  }

  return "";
};

export default function CompaniesBrief({ companies = [] }) {
  const { i18n, t } = useTranslation();

  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  const isRtl = lang === "ar";

  const safeCompanies = Array.isArray(companies) ? companies : [];

  const visibleCompanies = [...safeCompanies]
    .filter((company) => {
      const companyName = getLocalizedText(
        company?.companyName ?? company?.name,
        lang,
        "",
      );

      return Boolean(companyName);
    })
    .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
    .slice(0, 3);

  if (!visibleCompanies.length) {
    return null;
  }

  const fallbackLabel = (key, defaultValue) => {
    const value = t(key);

    if (typeof value !== "string" || value === key) {
      return defaultValue;
    }

    return value;
  };

  const getSafeWebsite = (website) => {
    if (!website || typeof website !== "string") {
      return null;
    }

    return /^https?:\/\//i.test(website) ? website : `https://${website}`;
  };

  const renderCompanyCard = (company, mobile = false) => {
    const companyName = getLocalizedText(
      company?.companyName ?? company?.name ?? company?.aboutus,
      lang,
      "",
    );

    const companyAbout = getLocalizedText(
      company?.brief ?? company?.about,
      lang,
      "",
    );

    const experienceField = getLocalizedText(
      company?.ExperienceField ?? company?.experienceField,
      lang,
      "",
    );

    const companyCountry = company?.country
      ? getCountryNameByCode(company.country, lang)
      : "";

    const companyLogo = getCompanyLogo(company);
    const companyBackground = getCompanyBackground(company);

    const companyHref = company?.slug
      ? `/company-details/${company.slug}`
      : "/companies";

    const websiteHref = getSafeWebsite(company?.website);

    return (
      <article
        className={`companies-brief-card ${
          mobile ? "companies-brief-card-mobile" : ""
        }`}
      >
        <div className="companies-brief-top-line" />

        <div className="companies-brief-media">
          <div className="companies-brief-media-overlay" />

          {companyBackground ? (
            <img
              src={companyBackground}
              alt={companyName}
              className="companies-brief-background-image"
              loading="lazy"
            />
          ) : (
            <div className="companies-brief-media-pattern" />
          )}
        </div>

        <div className="companies-brief-logo-wrap">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="companies-brief-logo"
              loading="lazy"
            />
          ) : (
            <div className="companies-brief-fallback-icon">
              {companyName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="companies-brief-content">
          {experienceField || companyCountry ? (
            <div
              className={`companies-brief-tags ${
                isRtl ? "companies-brief-tags-rtl" : ""
              }`}
            >
              {experienceField ? (
                <span className="companies-brief-primary-tag">
                  {experienceField}
                </span>
              ) : null}

              {companyCountry ? (
                <span className="companies-brief-secondary-tag">
                  {companyCountry}
                </span>
              ) : null}
            </div>
          ) : null}

          <h3 className="companies-brief-company-title">
            <Link href={companyHref}>{companyName}</Link>
          </h3>

          {companyAbout ? (
            <div
              className={`companies-brief-company-text ${
                mobile ? "companies-brief-company-text-mobile" : ""
              }`}
            >
              {parse(companyAbout)}
            </div>
          ) : null}

          <div className="companies-brief-footer">
            <Link href={companyHref} className="companies-brief-read-more">
              <span className="companies-brief-read-more-text">
                {fallbackLabel("read_more", "Read more")}
              </span>

              <span className="companies-brief-arrow">
                <i
                  className={`fas ${
                    isRtl ? "fa-arrow-left" : "fa-arrow-right"
                  }`}
                  aria-hidden="true"
                />
              </span>
            </Link>

            {websiteHref ? (
              <a
                href={websiteHref}
                target="_blank"
                rel="noreferrer"
                className="companies-brief-website"
                aria-label={`${companyName} website`}
              >
                <span className="companies-brief-website-icon">
                  <i className="fas fa-globe-americas" aria-hidden="true" />
                </span>

                <span>{fallbackLabel("website", "Website")}</span>
              </a>
            ) : (
              <div
                className="companies-brief-website companies-brief-website-placeholder"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="companies-brief-section">
      <div className="auto-container">
        <div className="jadwa-testimonials-head companies-brief-head">
          <div className="jadwa-pill">
            <span className="jadwa-pill-dot" />

            <span>{fallbackLabel("companies.title", "Companies")}</span>
          </div>

          <h2 className="jadwa-testimonials-title">
            {fallbackLabel(
              "about.ourCompaniesBrief",
              "A Brief Look At Our Companies",
            )}
          </h2>

          <p className="jadwa-testimonials-subtitle">
            {fallbackLabel(
              "companies.description",
              "A curated view of selected companies within our ecosystem.",
            )}
          </p>
        </div>

        <div className="row clearfix companies-brief-grid">
          {visibleCompanies.map((company, index) => (
            <div
              key={company?._id || company?.slug || index}
              className="col-lg-4 col-md-6 col-sm-12 mb-4"
            >
              {renderCompanyCard(company, false)}
            </div>
          ))}
        </div>

        <div
          key={`companies-mobile-slider-${lang}`}
          className="companies-brief-mobile-slider"
        >
          <Swiper
            key={`companies-swiper-${lang}-${isRtl ? "rtl" : "ltr"}`}
            modules={[Pagination]}
            spaceBetween={14}
            slidesPerView={1.08}
            pagination={{
              clickable: true,
            }}
            dir={isRtl ? "rtl" : "ltr"}
            className="companies-brief-swiper"
          >
            {visibleCompanies.map((company, index) => (
              <SwiperSlide
                key={`${lang}-${company?._id || company?.slug || index}`}
              >
                {renderCompanyCard(company, true)}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
