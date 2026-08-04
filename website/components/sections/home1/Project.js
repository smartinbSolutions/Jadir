"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { truncateText } from "@/GlobalHooks/GlobalHooks";
import getImageUrl from "@/components/utils/getImageUrl";

const FALLBACK_PROJECT_IMAGE = "/assets/images/news/news-1.jpg";

const getProjectImage = (project) => {
  const path =
    project?.imageUrl ||
    (project?.image ? `/uploads/projects/${project.image}` : "");

  return path ? getImageUrl(path) : FALLBACK_PROJECT_IMAGE;
};

export default function Project({ projects = [] }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  if (!projects.length) return null;

  return (
    <section className="project-section sec-pad">
      <div className="auto-container">
        <div className="sec-title">
          <span className="sub-title">
            {lang === "ar"
              ? "المشاريع"
              : lang === "tr"
                ? "Projeler"
                : "Projects"}
          </span>

          <h2>
            {lang === "ar"
              ? "أحدث المشاريع"
              : lang === "tr"
                ? "Güncel projeler"
                : "Latest Projects"}
          </h2>
        </div>

        <div className="row clearfix">
          {projects.slice(0, 3).map((project, index) => {
            const title =
              project?.title?.[lang] ||
              project?.title?.en ||
              project?.title?.ar ||
              project?.title?.tr ||
              "Project";

            const brief =
              project?.brief?.[lang] ||
              project?.brief?.en ||
              project?.brief?.ar ||
              project?.brief?.tr ||
              "";

            return (
              <div
                key={project?._id || index}
                className="col-lg-4 col-md-6 col-sm-12 news-block"
              >
                <div className="news-block-one h-100">
                  <div className="inner-box h-100 bg-white shadow-lg">
                    <div className="image-box">
                      <figure className="image">
                        <img
                          src={getProjectImage(project)}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
                          }}
                          alt={title}
                          style={{
                            width: "100%",
                            height: "240px",
                            objectFit: "cover",
                          }}
                        />
                      </figure>
                    </div>

                    <div className="lower-box">
                      <h3>{title}</h3>

                      <p>{truncateText(brief, 130)}</p>

                      {project?.projectLink ? (
                        <div className="link">
                          <Link
                            href={project.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>
                              {lang === "ar"
                                ? "عرض المشروع"
                                : lang === "tr"
                                  ? "Projeyi Gör"
                                  : "View Project"}
                            </span>
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
