import Layout from "@/components/layout/Layout";
import Link from "next/link";
import {
  getProjectBySlug,
  getWebsiteData,
  localize,
  truncate,
} from "@/components/website/websiteUtils";
import getImageUrl from "@/components/utils/getImageUrl";
import { useTranslation } from "react-i18next";
import parse from "html-react-parser";

const FALLBACK_PROJECT_IMAGE = "/assets/images/project/project-5.jpg";

const getProjectImage = (project) => {
  const path =
    project?.imageUrl ||
    (project?.image ? `/uploads/projects/${project.image}` : "");

  return path ? getImageUrl(path) : FALLBACK_PROJECT_IMAGE;
};

const blockLabels = {
  en: {
    project: "Project",
    back: "Back to projects",
    challenge: "Challenge",
    solution: "Solution",
    result: "Result",
  },
  ar: {
    project: "مشروع",
    back: "العودة إلى المشاريع",
    challenge: "التحدي",
    solution: "الحل",
    result: "النتيجة",
  },
  tr: {
    project: "Proje",
    back: "Projelere dön",
    challenge: "Zorluk",
    solution: "Çözüm",
    result: "Sonuç",
  },
};

function ProjectBlock({ title, text, index }) {
  if (!text) return null;

  return (
    <article className="jadir-project-detail-block">
      <div className="jadir-project-detail-block-count">
        {String(index).padStart(2, "0")}
      </div>

      <div className="jadir-project-detail-block-content">
        <h3>{title}</h3>

        <div
          className="jadir-project-detail-richtext"
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
      </div>
    </article>
  );
}

export default function ProjectDetailsPage({ project }) {
  const { i18n } = useTranslation();

  const lang = i18n.language || "en";
  const isRtl = lang === "ar";
  const copy = blockLabels[lang] || blockLabels.en;

  if (!project) return null;

  const title = localize(project?.title, lang);
  const brief = localize(project?.brief, lang);
  const image = getProjectImage(project);

  const blocks = [
    {
      title: copy.challenge,
      text: localize(project?.challenge, lang),
    },
    {
      title: copy.solution,
      text: localize(project?.solution, lang),
    },
    {
      title: copy.result,
      text: localize(project?.result, lang),
    },
  ].filter((item) => item.text);

  return (
    <Layout breadcrumbTitle={title} image={image}>
      <section
        className={`jadir-project-detail-page sec-pad ${isRtl ? "rtl" : "ltr"}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="auto-container">
          <div className="jadir-project-detail-hero">
            <div className="jadir-project-detail-media">
              <img
                className="jadir-project-detail-image"
                src={image}
                alt={title || "Project"}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
                }}
              />
            </div>

            <div className="jadir-project-detail-intro">
              <div className="jadir-project-detail-eyebrow">
                <span />
                {copy.project}
              </div>

              <h1>{title}</h1>

              {brief ? (
                <div className="jadir-project-detail-brief">
                  {parse(truncate(brief, 300))}
                </div>
              ) : null}

              <Link href="/projects" className="jadir-project-detail-back">
                <span>{copy.back}</span>

                <i
                  className={`fa-solid ${
                    isRtl ? "fa-arrow-left" : "fa-arrow-right"
                  }`}
                />
              </Link>
            </div>
          </div>

          {blocks.length > 0 ? (
            <div className="jadir-project-detail-content">
              {blocks.map((block, index) => (
                <ProjectBlock
                  key={block.title}
                  title={block.title}
                  text={block.text}
                  index={index + 1}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticPaths() {
  const data = await getWebsiteData();

  const projects = Array.isArray(data?.projects) ? data.projects : [];

  return {
    paths: projects
      .filter((project) => project?.slug)
      .map((project) => ({
        params: {
          slug: project.slug,
        },
      })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const project = await getProjectBySlug(params?.slug);

  if (!project) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  return {
    props: {
      project,
    },
    revalidate: 300,
  };
}
