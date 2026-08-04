import Layout from "@/components/layout/Layout";
import baseURL, { CareersEndPoint } from "@/api/GlobalData";

import { fetchJSON, pickArray } from "@/GlobalHooks/GlobalHooks";
import { useTranslation } from "react-i18next";
import { localize } from "@/components/website/websiteUtils";
import { useMemo } from "react";
import { getPageBanners, resolvePageBanner } from "@/lib/pageBanners";
import Link from "next/link";
import getImageUrl from "@/components/utils/getImageUrl";

const FALLBACK_CAREER_IMAGE = "/assets/images/news/news-1.jpg";

const getCareerImage = (career) => {
  const path =
    career?.imageUrl ||
    (career?.image ? `/uploads/careers/${career.image}` : "");

  return path ? getImageUrl(path) : FALLBACK_CAREER_IMAGE;
};
const labels = {
  en: {
    breadcrumb: "Career",
    eyebrow: "Open Roles",
    title: "Career Opportunities",
    subtitle:
      "Explore current openings and join a team focused on disciplined growth, investment insight, and long-term value.",
    empty: "There are no open roles right now.",
    apply: "Apply Now",
    endDate: "End Date",
    position: "Position",
    readMore: "Read more",
    closed: "Application closed",
    active: "Open role",
    expired: "Closed",
    totalRoles: "Total roles",
    openRoles: "Open roles",
    departments: "Departments",
    roleType: "Opportunity",
    location: "Location",
    remote: "Unspecified",
    available: "Available",
  },
  ar: {
    breadcrumb: "فرص العمل",
    eyebrow: "الوظائف المتاحة",
    title: "فرص العمل",
    subtitle:
      "استعرض الفرص الوظيفية الحالية وانضم إلى فريق يعمل برؤية واضحة ونمو منضبط وقيمة طويلة المدى.",
    empty: "لا توجد وظائف متاحة حاليا.",
    apply: "قدم الآن",
    endDate: "تاريخ الانتهاء",
    position: "المنصب",
    readMore: "اقرأ المزيد",
    closed: "انتهى التقديم",
    active: "متاحة",
    expired: "مغلقة",
    totalRoles: "إجمالي الوظائف",
    openRoles: "وظائف متاحة",
    departments: "الأقسام",
    roleType: "فرصة وظيفية",
    location: "الموقع",
    remote: "لم يتم التحديد",
    available: "متاح",
  },
  tr: {
    breadcrumb: "Kariyer",
    eyebrow: "Açık Roller",
    title: "Kariyer Fırsatları",
    subtitle:
      "Mevcut açık pozisyonları keşfedin; disiplinli büyüme, yatırım içgörüsü ve uzun vadeli değer odaklı bir ekibe katılın.",
    empty: "Şu anda açık pozisyon bulunmuyor.",
    apply: "Başvur",
    endDate: "Bitiş Tarihi",
    position: "Pozisyon",
    readMore: "Devamını oku",
    closed: "Başvuru kapandı",
    active: "Açık rol",
    expired: "Kapalı",
    totalRoles: "Toplam rol",
    openRoles: "Açık rol",
    departments: "Departmanlar",
    roleType: "Fırsat",
    location: "Konum",
    remote: "Belirtmemiş",
    available: "Başvurulabilir",
  },
};

export default function CareerPage({ careers = [], pageBanners = {} }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";
  const isRtl = lang === "ar";
  const copy = labels[lang] || labels.en;

  const stats = useMemo(() => {
    const open = careers.filter((career) => {
      if (!career?.endDate) return true;
      return new Date(career.endDate).getTime() >= Date.now();
    });

    const departments = new Set(
      careers
        .map((career) =>
          localize(
            career?.department || career?.category || career?.type,
            lang,
          ),
        )
        .filter(Boolean),
    );

    return {
      total: careers.length,
      open: open.length,
      departments: departments.size || Math.min(careers.length, 1),
    };
  }, [careers, lang]);

  return (
    <Layout
      breadcrumbTitle={copy.breadcrumb}
      image={resolvePageBanner("careers", pageBanners)}
    >
      <section
        className={`career-portal-page sec-pad ${isRtl ? "rtl" : "ltr"}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="auto-container">
          <div className="career-portal-hero">
            <div className="career-portal-hero-copy">
              <div className="career-portal-eyebrow">
                <span />
                {copy.eyebrow}
              </div>

              <h2>{copy.title}</h2>
              <p>{copy.subtitle}</p>
            </div>

            <div className="career-portal-stats">
              <div className="career-portal-stat">
                <strong>{String(stats.total).padStart(2, "0")}</strong>
                <span>{copy.totalRoles}</span>
              </div>

              <div className="career-portal-stat">
                <strong>{String(stats.open).padStart(2, "0")}</strong>
                <span>{copy.openRoles}</span>
              </div>
            </div>
          </div>

          {careers?.length ? (
            <div className="career-portal-board">
              <div className="career-portal-board-head">
                <div>
                  <span>{copy.eyebrow}</span>
                  <h3>{copy.title}</h3>
                </div>

                <div className="career-portal-board-count">
                  {stats.open} / {stats.total}
                </div>
              </div>

              <div className="career-portal-list">
                {careers?.map((career) => {
                  const title = localize(career?.title, lang);
                  const location =
                    localize(career?.location, lang) || copy.remote;
                  const detailUrl = `/career/${career?.slug || career?._id}`;
                  const imgSrc = getCareerImage(career);

                  const isExpired =
                    career?.endDate &&
                    new Date(career.endDate).getTime() < Date.now();

                  return (
                    <div key={career?._id} className="career-job-block">
                      <article className="career-job-card h-100">
                        <div className="career-job-image-wrap">
                          <figure className="career-job-image">
                            <img
                              src={imgSrc}
                              alt={title || "Career"}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = FALLBACK_CAREER_IMAGE;
                              }}
                            />{" "}
                          </figure>

                          <span
                            className={`career-job-status ${
                              isExpired ? "is-closed" : "is-open"
                            }`}
                          >
                            {isExpired ? copy.closed : copy.available}
                          </span>
                        </div>

                        <div className="career-job-content">
                          <h3 className="career-job-title">{title}</h3>

                          <div className="career-job-meta">
                            <span>
                              <i className="fa-solid fa-location-dot" />
                              {location}
                            </span>

                            <span>
                              <i className="fa-regular fa-calendar" />
                              {career?.endDate
                                ? `${copy.endDate}: ${new Date(
                                    career.endDate,
                                  ).toLocaleDateString(
                                    lang === "ar" ? "ar" : "en",
                                  )}`
                                : copy.endDate}
                            </span>
                          </div>

                          <div className="career-job-actions">
                            {!isExpired ? (
                              <Link
                                href={detailUrl}
                                className="services-redesign-link"
                              >
                                <span>{copy.apply}</span>
                                <i
                                  className={`services-redesign-arrow ${
                                    isRtl ? "rtl-arrow" : ""
                                  }`}
                                >
                                  →
                                </i>
                              </Link>
                            ) : (
                              <span className="career-job-closed-btn">
                                {copy.closed}
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="career-portal-empty">
              <div className="career-portal-empty-icon">
                <i className="fa-solid fa-briefcase" />
              </div>
              <h3>{copy.empty}</h3>
              <p>
                {lang === "ar"
                  ? "تابع الصفحة لاحقاً للاطلاع على الفرص الجديدة."
                  : lang === "tr"
                    ? "Yeni fırsatlar için bu sayfayı daha sonra tekrar kontrol edin."
                    : "Please check back later for new opportunities."}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const [payload, pageBanners] = await Promise.all([
      fetchJSON(`${baseURL}${CareersEndPoint}`),
      getPageBanners(),
    ]);

    return {
      props: {
        careers: pickArray(payload),
        pageBanners,
      },
      revalidate: 300,
    };
  } catch (error) {
    console.error("Failed to fetch careers", error);

    return {
      props: {
        careers: [],
        pageBanners: {},
      },
      revalidate: 60,
    };
  }
}
