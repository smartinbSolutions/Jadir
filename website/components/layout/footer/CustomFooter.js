"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import baseURL from "@/api/GlobalData";
import { fetchJSON, pickArray } from "@/GlobalHooks/GlobalHooks";
import { localize, siteLinks } from "@/components/website/websiteUtils";

const API_BASE_URL = String(baseURL || "").replace(/\/+$/, "");

const apiUrl = (endpoint = "") => {
  const cleanEndpoint = String(endpoint).replace(/^\/+/, "");

  return `${API_BASE_URL}/${cleanEndpoint}`;
};

const socialConfig = [
  {
    key: "facebook",
    icon: "fa-brands fa-facebook-f",
    label: "Facebook",
  },
  {
    key: "xTwitter",
    icon: "fa-brands fa-twitter",
    label: "X",
  },
  {
    key: "instagram",
    icon: "fa-brands fa-instagram",
    label: "Instagram",
  },
  {
    key: "linkedin",
    icon: "fa-brands fa-linkedin-in",
    label: "LinkedIn",
  },
];

const DAY_ORDER = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
};

const closedLabel = {
  en: "Closed",
  ar: "مغلق",
  tr: "Kapalı",
};

const defaultWorkingDaysLabel = {
  en: "Monday - Friday",
  ar: "الاثنين - الجمعة",
  tr: "Pazartesi - Cuma",
};

const formatDayRange = (days = []) => {
  const validDays = days.filter(Boolean);

  if (!validDays.length) {
    return "";
  }

  if (validDays.length === 1) {
    return validDays[0];
  }

  return `${validDays[0]} - ${validDays[validDays.length - 1]}`;
};

/*
 * تضغط الأيام المتتالية ضمن مجال واحد.
 *
 * مثال:
 * Monday, Tuesday, Wednesday, Thursday, Friday
 * النتيجة:
 * Monday - Friday
 *
 * وإذا كانت الأيام غير متتالية:
 * Monday, Wednesday
 * النتيجة:
 * Monday, Wednesday
 */
const formatSelectedDays = (selectedDays = [], allDays = [], lang = "en") => {
  const selectedKeys = new Set(
    selectedDays.map((day) => day?.key).filter(Boolean),
  );

  const groups = [];
  let currentGroup = [];

  allDays.forEach((day) => {
    const dayLabel = localize(day?.day, lang);

    if (selectedKeys.has(day?.key) && dayLabel) {
      currentGroup.push(dayLabel);
      return;
    }

    if (currentGroup.length) {
      groups.push(currentGroup);
      currentGroup = [];
    }
  });

  if (currentGroup.length) {
    groups.push(currentGroup);
  }

  return groups
    .map((group) => formatDayRange(group))
    .filter(Boolean)
    .join(", ");
};

const getLegacyWorkingTimes = (footerData, workingDays = []) => {
  const legacyOpenDay = workingDays.find(
    (day) => day?.startTime || day?.endTime,
  );

  let startTime = String(
    footerData?.workingStartTime || legacyOpenDay?.startTime || "",
  ).trim();

  let endTime = String(
    footerData?.workingEndTime || legacyOpenDay?.endTime || "",
  ).trim();

  if ((!startTime || !endTime) && footerData?.workingHours) {
    const parts = String(footerData.workingHours)
      .split(/\s*-\s*/)
      .map((value) => value.trim());

    startTime = startTime || parts[0] || "";
    endTime = endTime || parts[1] || "";
  }

  return {
    startTime,
    endTime,
  };
};

const buildWorkingScheduleRows = (footerData, lang = "en") => {
  const rawSchedule = Array.isArray(footerData?.workingSchedule)
    ? footerData.workingSchedule
    : [];

  const schedule = [...rawSchedule]
    .filter((day) => Boolean(localize(day?.day, lang)))
    .sort((a, b) => {
      const firstOrder = DAY_ORDER[a?.key] || Number(a?.order || 0);

      const secondOrder = DAY_ORDER[b?.key] || Number(b?.order || 0);

      return firstOrder - secondOrder;
    });

  /*
   * توافق مع بيانات Footer القديمة إذا لم يكن هناك workingSchedule.
   * يبقى العرض بنفس تصميم البطاقات.
   */
  if (!schedule.length) {
    const legacyDays =
      footerData?.workDays ||
      defaultWorkingDaysLabel[lang] ||
      defaultWorkingDaysLabel.en;

    const legacyHours =
      footerData?.workingHours ||
      [footerData?.workingStartTime, footerData?.workingEndTime]
        .filter(Boolean)
        .join(" - ") ||
      "09:00 - 17:00";

    return [
      {
        days: legacyDays,
        hours: legacyHours,
        isClosed: false,
      },
    ];
  }

  const workingDays = schedule.filter((day) => !Boolean(day?.isClosed));

  const daysOff = schedule.filter((day) => Boolean(day?.isClosed));

  const { startTime, endTime } = getLegacyWorkingTimes(footerData, workingDays);

  const workingHours =
    startTime && endTime
      ? `${startTime} - ${endTime}`
      : footerData?.workingHours || "";

  const rows = [];

  /*
   * الصف الأول: جميع أيام الدوام مع الوقت العام.
   */
  if (workingDays.length) {
    rows.push({
      days: formatSelectedDays(workingDays, schedule, lang),

      hours: workingHours || "09:00 - 17:00",
      isClosed: false,
    });
  }

  /*
   * الصف الثاني: جميع أيام العطلة.
   */
  if (daysOff.length) {
    rows.push({
      days: formatSelectedDays(daysOff, schedule, lang),

      hours: closedLabel[lang] || closedLabel.en,
      isClosed: true,
    });
  }

  return rows;
};

export default function CustomFooter() {
  const { i18n, t } = useTranslation();

  const resolvedLang = (i18n?.resolvedLanguage || i18n?.language || "en").split(
    "-",
  )[0];

  const lang = ["en", "ar", "tr"].includes(resolvedLang) ? resolvedLang : "en";

  const isRtl = lang === "ar";

  const [footerData, setFooterData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [policies, setPolicies] = useState([]);

  const workingSchedule = useMemo(() => {
    return buildWorkingScheduleRows(footerData, lang);
  }, [footerData, lang]);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      fetchJSON(apiUrl("footer")),
      fetchJSON(apiUrl("contact-us/public")),
      fetchJSON(apiUrl("policies/public")),
    ]).then((results) => {
      if (!mounted) return;

      const footerPayload =
        results[0].status === "fulfilled" ? results[0].value : null;

      const contactPayload =
        results[1].status === "fulfilled" ? results[1].value : null;

      setFooterData(footerPayload?.data || footerPayload || null);

      setContactData(contactPayload?.data || contactPayload || null);

      setPolicies(
        results[2].status === "fulfilled" ? pickArray(results[2].value) : [],
      );
    });

    return () => {
      mounted = false;
    };
  }, []);

  const socialLinks = useMemo(
    () =>
      socialConfig
        .filter((item) => footerData?.[item.key])
        .map((item) => ({
          ...item,
          href: footerData[item.key],
        })),
    [footerData],
  );

  const currentYear = new Date().getFullYear();

  const address =
    localize(contactData?.address, lang) ||
    localize(footerData?.address, lang) ||
    "Istanbul, Turkey";

  const phone = contactData?.phones?.[0] || footerData?.phone || "";

  const email = contactData?.emails?.[0] || footerData?.email || "";

  return (
    <section
      className={`footer-premium ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="footer-premium-main">
        <div className="auto-container">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
              <div className="footer-widget footer-premium-widget">
                <div className="footer-logo footer-premium-logo">
                  <Link href="/">
                    <img
                      className="footer-premium-logo-img"
                      src="/assets/images/jadir-logo.png"
                      alt="Jadir"
                    />
                  </Link>
                </div>

                <p className="footer-premium-desc">
                  {localize(footerData?.description, lang) ||
                    "Structured advisory, services, projects, and insights for better business decisions."}
                </p>

                <div className="footer-premium-socials">
                  {socialLinks.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className="footer-premium-social-link"
                    >
                      <i className={item.icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 col-sm-12 footer-column">
              <div className="footer-widget footer-premium-widget">
                <div className="widget-title footer-premium-widget-title">
                  <h3>{t("quickLinks")}</h3>
                </div>

                <ul className="links-list clearfix footer-premium-links">
                  {siteLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{t(item.label)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
              <div className="footer-widget footer-premium-widget">
                <div className="widget-title footer-premium-widget-title">
                  <h3>{t("policies")}</h3>
                </div>

                <ul className="links-list clearfix footer-premium-links">
                  {policies.map((policy) => (
                    <li key={policy?._id || policy?.slug}>
                      <Link href={`/policies/${policy?.slug}`}>
                        {localize(policy?.title, lang)}
                      </Link>
                    </li>
                  ))}

                  {!policies.length ? (
                    <li>
                      <Link href="/policies">{t("privacyTerms")}</Link>
                    </li>
                  ) : null}
                </ul>

                <div className="footer-premium-schedule">
                  <strong>{t("workDaysHours")}</strong>

                  {workingSchedule.length ? (
                    <ul className="footer-premium-schedule-list">
                      {workingSchedule.map((item, index) => (
                        <li
                          key={`${item.days}-${index}`}
                          className={item.isClosed ? "is-closed" : "is-open"}
                        >
                          <span>{item.days}</span>

                          <strong dir={item.isClosed ? undefined : "ltr"}>
                            {item.hours}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-12 col-sm-12 footer-column">
              <div className="footer-widget contact-widget footer-premium-widget footer-premium-contact">
                <div className="widget-title footer-premium-widget-title">
                  <h3>{t("contactInfo")}</h3>
                </div>

                <ul className="footer-premium-contact-list">
                  {phone ? (
                    <li>
                      <span className="footer-premium-contact-icon">
                        <i className="fas fa-phone-alt" />
                      </span>

                      <a href={`tel:${phone.replace(/\s+/g, "")}`} dir="ltr">
                        {phone}
                      </a>
                    </li>
                  ) : null}

                  {email ? (
                    <li>
                      <span className="footer-premium-contact-icon">
                        <i className="fas fa-envelope" />
                      </span>

                      <a href={`mailto:${email}`}>{email}</a>
                    </li>
                  ) : null}

                  {address ? (
                    <li>
                      <span className="footer-premium-contact-icon">
                        <i className="fas fa-map-marker-alt" />
                      </span>

                      <a
                        href={contactData?.mapLink || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {address}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-premium-newsletter-wrap">
            <div className="row clearfix align-items-center">
              <div className="col-lg-5 col-md-12 col-sm-12">
                <div className="footer-widget footer-premium-widget newsletter-bg">
                  <div className="widget-title footer-premium-widget-title">
                    <h3>{t("newsletter")}</h3>
                  </div>

                  <p className="footer-premium-newsletter-text">
                    {t("newsletterText")}
                  </p>
                </div>
              </div>

              <div className="col-lg-7 col-md-12 col-sm-12">
                <form onSubmit={(event) => event.preventDefault()}>
                  <div className="footer-premium-newsletter-form">
                    <input
                      type="email"
                      placeholder={t("enterYourEmail")}
                      className="footer-premium-input"
                    />

                    <button
                      type="submit"
                      className="theme-btn btn-two footer-premium-btn"
                    >
                      <span>{t("subscribe")}</span>

                      <i className="fas fa-paper-plane" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-premium-bottom">
        <div className="auto-container">
          <div className="footer-premium-bottom-inner">
            <div className="footer-premium-bottom-left">
              <div className="footer-premium-bottom-brand">
                <p>
                  {t("allRightsReserved")} &copy; {currentYear}
                </p>
              </div>

              <ul className="clearfix footer-premium-bottom-nav">
                {policies.slice(0, 4).map((item) => (
                  <li key={item?._id || item?.slug}>
                    <Link href={`/policies/${item?.slug}`}>
                      {localize(item?.title, lang)}
                    </Link>
                  </li>
                ))}
              </ul>

              <a
                href="https://smartinb.com"
                target="_blank"
                rel="noreferrer"
                className="footer-premium-credit"
                aria-label="Developed by Smartinb"
              >
                <span className="footer-premium-credit-text">
                  {t("developedBy")}
                </span>

                <span className="footer-premium-credit-brand">
                  <span className="footer-premium-credit-dot" />
                  Smartinb
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
