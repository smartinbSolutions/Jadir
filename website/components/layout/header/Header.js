"use client";

import Link from "next/link";
import Menu from "../Menu";
import SearchBox from "../SearchBox";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/helpers";

const supportedLangs = ["en", "ar", "tr"];

const socialConfig = [
  { key: "facebook", icon: "fa-brands fa-facebook-f", label: "Facebook" },
  { key: "xTwitter", icon: "fa-brands fa-twitter", label: "X" },
  { key: "instagram", icon: "fa-brands fa-instagram", label: "Instagram" },
  { key: "linkedin", icon: "fa-brands fa-linkedin-in", label: "LinkedIn" },
];

export default function Header({
  scroll,
  handleMobileMenu,
  sticky,
  footerData,
}) {
  const isMobile = useIsMobile();
  const { i18n, t } = useTranslation();
  const [activeLang, setActiveLang] = useState("en");
  const [openSearch, setOpenSearch] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [suggestedLang, setSuggestedLang] = useState("en");
  const [userLocation, setUserLocation] = useState("");

  const languages = useMemo(
    () => [
      { value: "en", label: t("English") },
      { value: "ar", label: t("Arabic") },
      { value: "tr", label: t("Turkish") },
    ],
    [t],
  );

  useEffect(() => {
    const match = document.cookie.match(
      /(?:^|;\s*)site_lang=(en|ar|tr)(?:;|$)/,
    );

    // تطبيق اللغة التي اختارها المستخدم سابقاً
    if (match) {
      setActiveLang(match[1]);
      return;
    }

    // في حال عدم وجود لغة محفوظة، يبقى الموقع بالإنجليزية
    // واكتشاف الموقع يقدم اقتراحاً فقط
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        let userLang = data?.languages
          ? data.languages.split(",")[0].slice(0, 2)
          : "en";

        if (!supportedLangs.includes(userLang)) {
          userLang = "en";
        }

        setSuggestedLang(userLang);
        setShowModal(true);

        const location = `${data?.city || "Unknown City"}, ${
          data?.region || "Unknown Region"
        }, ${data?.country_name || "Unknown Country"}`;

        setUserLocation(location);
      })
      .catch(() => {
        setSuggestedLang("en");
        setShowModal(true);
        setUserLocation("Unknown Location");
      });
  }, []);

  useEffect(() => {
    i18n.changeLanguage(activeLang);
    document.documentElement.dir = activeLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = activeLang;
  }, [activeLang, i18n]);

  const socialLinks = useMemo(
    () =>
      socialConfig
        .filter((item) => footerData?.[item.key])
        .map((item) => ({ ...item, href: footerData[item.key] })),
    [footerData],
  );

  const saveLanguage = (lng) => {
    setActiveLang(lng);
    document.cookie = `site_lang=${lng}; path=/; max-age=${30 * 24 * 60 * 60}`;

    setShowModal(false);
  };

  const handleAccept = () => {
    saveLanguage(suggestedLang);
  };

  const handleOtherLang = (lng) => {
    saveLanguage(lng);
  };

  return (
    <>
      <header
        className={`jadwa-header ${scroll || sticky ? "is-sticky" : ""} ${
          openSearch ? "is-search-open" : ""
        }`}
      >
        <div className="outer-container">
          <div className="jadwa-header-wrap">
            <div className="jadwa-header-lower">
              <div className="jadwa-header-inner">
                <div className="jadwa-logo-box">
                  <Link href="/" aria-label="Go to homepage">
                    <img
                      src="/assets/images/logos/jadir-dark.png"
                      alt="Jadir"
                      className="jadwa-logo"
                    />
                  </Link>
                </div>

                <div className="jadwa-header-stack">
                  <div className="jadwa-header-meta">
                    <div className="jadwa-header-tagline">
                      {t("digitalFinancialSolutions")}
                    </div>

                    <div className="jadwa-header-meta-actions">
                      <div className="jadwa-header-socials">
                        {footerData?.phone ? (
                          <a
                            href={`tel:${footerData.phone.replace(/\s+/g, "")}`}
                            aria-label="Phone"
                            className="jadwa-social-link"
                          >
                            <i className="fa-solid fa-phone" />
                          </a>
                        ) : null}

                        {footerData?.email ? (
                          <a
                            href={`mailto:${footerData.email}`}
                            aria-label="Email"
                            className="jadwa-social-link"
                          >
                            <i className="fa-solid fa-envelope" />
                          </a>
                        ) : null}

                        {socialLinks.map((item) => (
                          <a
                            key={item.key}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={item.label}
                            className="jadwa-social-link"
                          >
                            <i className={item.icon} />
                          </a>
                        ))}
                      </div>

                      <div className="jadwa-select-box">
                        <select
                          className="jadwa-language-select"
                          value={activeLang}
                          onChange={(e) => handleOtherLang(e.target.value)}
                          aria-label="Select language"
                        >
                          {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                              {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="jadwa-header-main-row">
                    {!isMobile && openSearch ? (
                      <SearchBox
                        autoFocus
                        variant="desktop"
                        className="jadwa-header-search"
                        onClose={() => setOpenSearch(false)}
                      />
                    ) : (
                      <nav className="jadwa-nav main-menu navbar-expand-md navbar-light">
                        <div
                          className="collapse navbar-collapse clearfix"
                          id="navbarSupportedContent"
                        >
                          <Menu />
                        </div>
                      </nav>
                    )}

                    <div className="jadwa-header-actions">
                      {!isMobile && !openSearch && (
                        <button
                          type="button"
                          aria-label="Open search"
                          onClick={() => setOpenSearch(true)}
                          className="jadwa-search-icon"
                        >
                          <i className="fa-solid fa-magnifying-glass" />
                        </button>
                      )}

                      <Link href="/contact" className="jadwa-invest-btn">
                        {t("requestConsult")}
                      </Link>

                      <button
                        type="button"
                        className="mobile-nav-toggler jadwa-mobile-toggler"
                        onClick={handleMobileMenu}
                        aria-label="Open mobile menu"
                      >
                        <i className="icon-bar" />
                        <i className="icon-bar" />
                        <i className="icon-bar" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showModal && (
        <div className="language-sheet-overlay">
          <div className="language-sheet">
            <div className="language-sheet-handle" />

            <div className="language-sheet-header">
              <div>
                <span className="language-sheet-eyebrow">{userLocation}</span>

                <h2>{t("languagePreference")}</h2>

                <p>
                  {t("locationDetected", {
                    location: userLocation,
                    language:
                      languages.find((item) => item.value === suggestedLang)
                        ?.label || suggestedLang.toUpperCase(),
                  })}
                </p>
              </div>
            </div>

            <div className="language-suggested-card">
              <span className="language-suggested-label">
                {t("recommended")}
              </span>

              <div>
                <strong>
                  {languages.find((item) => item.value === suggestedLang)
                    ?.label || suggestedLang.toUpperCase()}
                </strong>

                <small>{userLocation}</small>
              </div>

              <button type="button" onClick={handleAccept}>
                {t("accept")}
              </button>
            </div>

            <p className="language-sheet-subtitle">
              {t("chooseAnotherLanguage")}
            </p>

            <div className="language-grid">
              {supportedLangs
                .filter((lng) => lng !== suggestedLang)
                .map((lng) => (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => handleOtherLang(lng)}
                    className="language-grid-item"
                  >
                    <span className="language-code">{lng.toUpperCase()}</span>

                    <span>
                      {languages.find((item) => item.value === lng)?.label ||
                        lng}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
