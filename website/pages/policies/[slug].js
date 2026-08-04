import Layout from "@/components/layout/Layout";
import parse from "html-react-parser";

import {
  getPolicyBySlug,
  getWebsiteData,
  localize,
} from "@/components/website/websiteUtils";

import { getPageBanners, resolvePageBanner } from "@/lib/pageBanners";

import { useTranslation } from "react-i18next";

export default function PolicyDetailsPage({ policy, pageBanners = {} }) {
  const { i18n } = useTranslation();

  const lang = i18n?.language || "en";

  if (!policy) return null;

  const title = localize(policy?.title, lang);

  const summary = localize(policy?.summary, lang);

  const content = localize(policy?.content, lang);

  return (
    <Layout
      breadcrumbTitle={title}
      image={resolvePageBanner("policies", pageBanners)}
    >
      <section className="policy-details-section sec-pad">
        <div className="auto-container">
          <div className="policy-details-wrapper">
            <div className="policy-details-header centred">
              <h1
                style={{
                  color: "#00024f",
                }}
              >
                {title}
              </h1>

              {summary ? (
                <div className="policy-details-summary">{parse(summary)}</div>
              ) : null}
            </div>

            <div className="policy-details-body">
              <div className="policy-details-content">
                {content ? parse(content) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticPaths() {
  try {
    const data = await getWebsiteData();

    const policies = Array.isArray(data?.policies) ? data.policies : [];

    return {
      paths: policies
        .filter((policy) => policy?.slug)
        .map((policy) => ({
          params: {
            slug: policy.slug,
          },
        })),

      fallback: "blocking",
    };
  } catch (error) {
    console.error("Failed to generate policy paths:", error);

    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const [policy, pageBanners] = await Promise.all([
      getPolicyBySlug(params?.slug),
      getPageBanners(),
    ]);

    if (!policy) {
      return {
        notFound: true,
        revalidate: 60,
      };
    }

    return {
      props: {
        policy,
        pageBanners: pageBanners || {},
      },

      revalidate: 300,
    };
  } catch (error) {
    console.error("Failed to fetch policy details:", error);

    return {
      notFound: true,
      revalidate: 60,
    };
  }
}
