import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { getOtherData } from "@/api/getOtherData";
import { useTranslation } from "react-i18next";
import { getPageBanners, resolvePageBanner } from "@/lib/pageBanners";
import { stripHtml } from "@/components/utils/helpers";
import getImageUrl from "@/components/utils/getImageUrl";

const FALLBACK_PROJECT_IMAGE = "/assets/images/news/news-1.jpg";

const getProjectImage = (project) => {
  const path =
    project?.imageUrl ||
    (project?.image ? `/uploads/projects/${project.image}` : "");

  return path ? getImageUrl(path) : FALLBACK_PROJECT_IMAGE;
};

export default function ProjectsPage({ projects = [], pageBanners = {} }) {
  const { i18n } = useTranslation();

  const lang = i18n.language || "en";
  const isRtl = lang === "ar";

  return (
    <Layout
      image={resolvePageBanner("projects", pageBanners)}
      breadcrumbTitle={
        lang === "ar" ? "المشاريع" : lang === "tr" ? "Projeler" : "Projects"
      }
    >
      <section
        className={`jadir-projects-page sec-pad ${isRtl ? "rtl" : "ltr"}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="auto-container">
          <div className="jadir-projects-head">
            <span className="jadir-projects-eyebrow">
              {lang === "ar"
                ? "مشاريعنا"
                : lang === "tr"
                  ? "Projelerimiz"
                  : "Our Projects"}
            </span>

            <h2>
              {lang === "ar"
                ? "مشاريع مختارة تعكس طريقة عملنا"
                : lang === "tr"
                  ? "Çalışma yaklaşımımızı yansıtan seçili projeler"
                  : "Selected projects that reflect how we work"}
            </h2>

            <p>
              {lang === "ar"
                ? "استعرض نماذج من المشاريع التي تجمع بين الفهم الاستراتيجي والتنفيذ العملي."
                : lang === "tr"
                  ? "Stratejik anlayış ile pratik uygulamayı bir araya getiren projeleri inceleyin."
                  : "Explore selected work shaped by strategic insight, practical execution, and measurable business value."}
            </p>
          </div>

          <div className="jadir-projects-list">
            {projects.map((project, index) => (
              <ProjectRow
                key={project?._id || index}
                project={project}
                lang={lang}
                index={index}
                isRtl={isRtl}
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

const ProjectRow = ({ project, lang, index, isRtl }) => {
  const title =
    project?.title?.[lang] ||
    project?.title?.en ||
    project?.title?.ar ||
    project?.title?.tr ||
    "Project";

  const briefHtml =
    project?.brief?.[lang] ||
    project?.brief?.en ||
    project?.brief?.ar ||
    project?.brief?.tr ||
    "";

  const plainText = stripHtml(briefHtml);

  const projectIdentifier = project?.slug || project?._id;

  const href = projectIdentifier
    ? `/projects/${encodeURIComponent(projectIdentifier)}`
    : "/projects";

  const isReversed = index % 2 === 1;
  const imageSrc = getProjectImage(project);

  return (
    <article className={`jadir-project-row ${isReversed ? "is-reversed" : ""}`}>
      <Link href={href} className="jadir-project-visual">
        <div className="jadir-project-visual-inner">
          <img
            src={imageSrc}
            alt={title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
            }}
          />

          <div className="jadir-project-image-badge">
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>
      </Link>

      <div className="jadir-project-copy">
        <div className="jadir-project-kicker">
          <span />

          {lang === "ar"
            ? "دراسة حالة"
            : lang === "tr"
              ? "Vaka çalışması"
              : "Case study"}
        </div>

        <h3>
          <Link href={href}>{title}</Link>
        </h3>

        <p>{plainText}</p>

        <div className="jadir-project-footer">
          <Link href={href} className="jadir-project-link">
            <span>
              {lang === "ar"
                ? "فتح المشروع"
                : lang === "tr"
                  ? "Projeyi Aç"
                  : "Open Project"}
            </span>

            <i
              className={
                isRtl ? "fa-solid fa-arrow-left" : "fa-solid fa-arrow-right"
              }
            />
          </Link>
        </div>
      </div>
    </article>
  );
};

export async function getStaticProps() {
  const [{ projects = [] }, pageBanners] = await Promise.all([
    getOtherData(),
    getPageBanners(),
  ]);

  return {
    props: {
      projects: Array.isArray(projects) ? projects : [],
      pageBanners: pageBanners || {},
    },
    revalidate: 300,
  };
}
