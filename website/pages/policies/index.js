import Layout from "@/components/layout/Layout";
import { EmptyState, SectionTitle } from "@/components/website/PublicSections";

import {
  getWebsiteData,
  localize,
  truncate,
} from "@/components/website/websiteUtils";

import { getPageBanners, resolvePageBanner } from "@/lib/pageBanners";

import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function PoliciesPage({ policies = [], pageBanners = {} }) {
  const { i18n, t } = useTranslation();

  const lang = i18n?.language || "en";
  const isRtl = lang === "ar";

  return (
    <Layout
      breadcrumbTitle={t("policies")}
      image={resolvePageBanner("policies", pageBanners)}
    >
      <section
        className={`site-band ${isRtl ? "rtl" : "ltr"}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="auto-container">
          <SectionTitle
            eyebrow={t("policiesPage.subtitle")}
            title={t("policiesPage.title")}
            text={t("policiesPage.description")}
          />

          {policies.length ? (
            <div className="row g-4">
              {policies.map((policy, index) => {
                const href = `/policies/${policy?.slug}`;

                const title = localize(policy?.title, lang);

                const summary = truncate(localize(policy?.summary, lang), 140);

                return (
                  <div
                    key={policy?._id || policy?.slug}
                    className="col-xl-4 col-lg-4 col-md-6 col-sm-12"
                  >
                    <article className="services-redesign-card h-100">
                      <div className="services-redesign-card-top">
                        <div className="services-redesign-number">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="services-redesign-line" />

                        <div className="services-redesign-label">
                          {lang === "ar"
                            ? "سياسة"
                            : lang === "tr"
                              ? "Politika"
                              : "Policy"}
                        </div>
                      </div>

                      <div className="services-redesign-card-body">
                        <h3 className="services-redesign-card-title">
                          <Link href={href}>{title}</Link>
                        </h3>

                        <p className="services-redesign-card-text">{summary}</p>
                      </div>

                      <div className="services-redesign-card-footer">
                        <Link href={href} className="services-redesign-link">
                          <span>{t("learnMore")}</span>

                          <i
                            className={`services-redesign-arrow ${
                              isRtl ? "rtl-arrow" : ""
                            }`}
                          >
                            →
                          </i>
                        </Link>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No policies available yet." />
          )}
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const [data, pageBanners] = await Promise.all([
      getWebsiteData(),
      getPageBanners(),
    ]);

    return {
      props: {
        policies: Array.isArray(data?.policies) ? data.policies : [],

        pageBanners: pageBanners || {},
      },

      revalidate: 300,
    };
  } catch (error) {
    console.error("Failed to fetch policies page:", error);

    return {
      props: {
        policies: [],
        pageBanners: {},
      },

      revalidate: 60,
    };
  }
}
