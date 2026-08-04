"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import About_us from "@/components/sections/home3/About";
import Statistics from "@/components/sections/home3/Statistics";
import Sectors from "@/components/sections/home1/Sectors";
import TeamlSlider from "@/components/pages/AboutUs/TeamlSlider";
import FounderSlides from "@/components/pages/AboutUs/FounderSlider";
import CompaniesBrief from "@/components/pages/AboutUs/CompaniesBrief";
import { getOtherData } from "@/api/getOtherData";
import { getHomeData } from "@/api/getHomeData";
import { TrustedLogos } from "@/components/website/PublicSections";

import { resolvePageBanner } from "@/lib/pageBanners";
import TestimonialsShowcase from "@/components/slider/TestimonialSlider03";

const PAGE_COPY = {
  en: {
    title: "About Jadir",
    subtitle: "Company profile",
    description:
      "Explore Jadir through our story, the people who trust us, and the numbers that reflect our work.",
    sections: {
      about: {
        tab: "About",
        title: "About our company",
        description:
          "A closer look at Jadir's approach, values, leadership, and team.",
      },
      trusted: {
        tab: "Who trusted us",
        title: "Partners and clients who trusted Jadir",
        description:
          "A view of the companies, partners, and client voices connected to our work.",
      },
      numbers: {
        tab: "Jadir in numbers",
        title: "Jadir in numbers",
        description:
          "A quick look at the company indicators and milestones behind our progress.",
      },
    },
  },
  tr: {
    title: "Jadir Hakkinda",
    subtitle: "Sirket profili",
    description:
      "Jadir'i hikayemiz, bize guvenenler ve calismamizi yansitan rakamlar uzerinden kesfedin.",
    sections: {
      about: {
        tab: "Hakkimizda",
        title: "Sirketimiz hakkinda",
        description:
          "Jadir'in yaklasimina, degerlerine, liderligine ve ekibine daha yakindan bakin.",
      },
      trusted: {
        tab: "Bize guvenenler",
        title: "Jadir'e guvenen ortaklar ve musteriler",
        description:
          "Calismalarimizla baglantili sirketleri, ortaklari ve musteri goruslerini inceleyin.",
      },
      numbers: {
        tab: "Rakamlarla Jadir",
        title: "Rakamlarla Jadir",
        description:
          "Ilerlememizin arkasindaki sirket gostergelerine ve kilometre taslarina hizli bir bakis.",
      },
    },
  },
  ar: {
    title: "عن جدير",
    subtitle: "الملف التعريفي",
    description:
      "تعرف على جدير من خلال قصتنا، والجهات التي وثقت بنا، والأرقام التي تعكس عملنا.",
    sections: {
      about: {
        tab: "من نحن",
        title: "نبذة عن الشركة",
        description: "نظرة أقرب على نهج جدير وقيمها وقيادتها وفريقها.",
      },
      trusted: {
        tab: "من وثق بنا",
        title: "شركاء وعملاء وثقوا بجدير",
        description: "استعراض للشركات والشركاء وآراء العملاء المرتبطين بعملنا.",
      },
      numbers: {
        tab: "جدير بالأرقام",
        title: "جدير بالأرقام",
        description: "نظرة سريعة على مؤشرات الشركة ومحطاتها التي تعكس تقدمنا.",
      },
    },
  },
};

export async function getStaticProps() {
  try {
    const data = await getOtherData();
    const homeData = await getHomeData();
    return { props: { data, homeData }, revalidate: 300 };
  } catch (err) {
    console.error("Other data error:", err);
    return { props: { data: {}, homeData: {} }, revalidate: 300 };
  }
}

export default function About({ data = {}, homeData = {} }) {
  const { i18n, t } = useTranslation();
  const lang = i18n?.language || "en";
  const isArabic = lang === "ar";
  const copy = PAGE_COPY[lang] || PAGE_COPY.en;
  const [activeTab, setActiveTab] = useState("about");
  const [activeAboutCard, setActiveAboutCard] = useState("business");

  const {
    aboutUs = [],
    members = [],
    testimonials = [],
    companies = [],
    statistics = [],
  } = data;

  const { values = [], about = {}, partners = [] } = homeData;

  const boardMembers = members?.filter((item) => item.isFounder);
  const team = members?.filter((item) => !item.isFounder);
  const item = Array.isArray(aboutUs) ? aboutUs[0] || {} : aboutUs || {};

  const localizedText = (field, currentLang) =>
    field?.[currentLang] || field?.en || "";

  const businessApproach = item?.businessApproach;
  const whyUs = item?.whyUs;
  const whoWeServe = item?.whoWeServe;
  const prizes = item?.prizes || [];
  const certificates = item?.certificates || [];

  const aboutCards = [
    businessApproach && {
      key: "business",
      icon: "fa-solid fa-chart-line",
      title: t("about.businessApproach"),
      content: localizedText(businessApproach, lang),
    },
    whoWeServe && {
      key: "whoWeServe",
      icon: "fa-solid fa-scale-balanced",
      title: t("about.whoWeServe"),
      content: localizedText(whoWeServe, lang),
    },
    whyUs && {
      key: "whyus",
      icon: "fa-solid fa-shield-heart",
      title: t("about.whyUs"),
      content: localizedText(whyUs, lang),
    },
  ].filter(Boolean);

  const hasAboutBlocks =
    businessApproach ||
    whyUs ||
    whoWeServe ||
    prizes?.length ||
    certificates?.length;

  return (
    <Layout
      headerStyle={1}
      footerStyle={1}
      breadcrumbTitle={t("about.about-us")}
      image={resolvePageBanner("about", data?.pageBanners)}
    >
      <section
        className={`about-tabs-page sec-pad ${isArabic ? "rtl" : ""}`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="auto-container">
          <div className="jadwa-testimonials-head about-tabs-page-head">
            <div className="jadwa-pill">
              <span className="jadwa-pill-dot" />
              <span>{copy.subtitle}</span>
            </div>

            <h2 className="jadwa-testimonials-title">{copy.title}</h2>
            <p className="jadwa-testimonials-subtitle">{copy.description}</p>
          </div>

          <div className="about-tabs-toolbar">
            <div className="about-tabs-list" role="tablist">
              {Object.keys(copy.sections).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={`about-tab-btn ${
                    activeTab === key ? "active" : ""
                  }`}
                >
                  {copy.sections[key].tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="about-tabs-content">
          {activeTab === "about" && (
            <div className="about-page-content">
              <About_us aboutUs={about} />

              {values?.length > 0 && <Sectors values={values} />}

              {hasAboutBlocks && (
                <div className="about-page-group about-page-more">
                  <div className="auto-container">
                    {!!aboutCards.length && (
                      <>
                        <div className="jadwa-testimonials-head about-page-head">
                          <div className="jadwa-pill">
                            <span className="jadwa-pill-dot" />
                            <span>{t("about.about-us")}</span>
                          </div>

                          <h2 className="jadwa-testimonials-title">
                            {t("about.moreAboutUs")}
                          </h2>

                          <p className="jadwa-testimonials-subtitle">
                            {lang === "ar"
                              ? "نقدم نهجاً استشارياً قائماً على الانضباط والحوكمة والرؤية طويلة المدى."
                              : lang === "tr"
                                ? "Disiplin, yonetisim ve uzun vadeli bakis acisina dayali bir danismanlik yaklasimi sunuyoruz."
                                : "We bring together disciplined strategy, strong governance, and a long-term business perspective."}
                          </p>
                        </div>

                        <div className="about-value-dynamic-layout">
                          {aboutCards.map((card) => {
                            const isActive = activeAboutCard === card.key;

                            return (
                              <div
                                key={card.key}
                                className={`about-value-dynamic-card ${
                                  isActive ? "is-active" : "is-inactive"
                                }`}
                                onMouseEnter={() =>
                                  setActiveAboutCard(card.key)
                                }
                              >
                                <div className="about-value-pattern" />

                                <div
                                  className={`about-value-icon ${
                                    isActive ? "" : "about-value-icon-light"
                                  }`}
                                >
                                  <i className={card.icon} />
                                </div>

                                <div className="about-value-content">
                                  <h3
                                    className={`about-value-title ${
                                      isActive ? "" : "about-value-title-light"
                                    }`}
                                  >
                                    {card.title}
                                  </h3>

                                  <div
                                    className={`about-value-text ${
                                      isActive ? "" : "about-value-text-light"
                                    }`}
                                  >
                                    <p
                                      dangerouslySetInnerHTML={{
                                        __html: card.content,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!!boardMembers?.length && (
                <div className="auto-container sec-pad">
                  <div className="jadwa-testimonials-head about-page-head">
                    <div className="jadwa-pill">
                      <span className="jadwa-pill-dot" />
                      <span>{t("about.about-us")}</span>
                    </div>

                    <h2 className="jadwa-testimonials-title">
                      {t("about.theFounders")}
                    </h2>
                  </div>

                  <FounderSlides founders={boardMembers} variant="founders" />
                </div>
              )}

              {!!team?.length && (
                <div className="auto-container" id="team">
                  <div className="jadwa-testimonials-head about-page-head">
                    <div className="jadwa-pill">
                      <span className="jadwa-pill-dot" />
                      <span>{t("about.about-us")}</span>
                    </div>

                    <h2 className="jadwa-testimonials-title">
                      {t("about.ourTeam")}
                    </h2>
                  </div>

                  <FounderSlides founders={team} variant="team" />
                  {/* <TeamlSlider team={team} variant="team" /> */}
                </div>
              )}

              {/* {!!companies?.length && <CompaniesBrief companies={companies} />} */}
            </div>
          )}

          {activeTab === "trusted" && (
            <div className="about-page-content">
              <TrustedLogos partners={partners} companies={companies} />
              <TestimonialsShowcase testimonials={testimonials} />{" "}
            </div>
          )}

          {activeTab === "numbers" && (
            <div className="about-page-content">
              <Statistics statistics={statistics} isAbout={true} />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
