import Link from "next/link";
import parse from "html-react-parser";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import {
  asset,
  localize,
  siteLinks,
  stripHtml,
  truncate,
} from "./websiteUtils";
import { formatDate } from "@/GlobalHooks/GlobalHooks";
import baseURL from "@/api/GlobalData";
import getImageUrl from "@/components/utils/getImageUrl";
import ShareArticle from "@/components/elements/ShareArticle";
import { useIsMobile } from "@/lib/helpers";

const fallbackHero = [
  { image: "banner-4.jpg", folder: "banner" },
  { image: "banner-5.jpg", folder: "banner" },
  { image: "banner-6.jpg", folder: "banner" },
];

export function SectionTitle({ eyebrow, title, text, light = false }) {
  return (
    <div className={`statistics-head ${light ? "is-light" : ""}`}>
      {eyebrow ? <span className="statistics-subtitle">{eyebrow}</span> : null}
      <h2 className="jadwa-services-title">{title}</h2>
      {text ? <p className="jadwa-triple-title">{text}</p> : null}
    </div>
  );
}

export function EmptyState({ title = "No content available yet." }) {
  return <div className="site-empty">{title}</div>;
}

export function HeroImages({ slides = [] }) {
  const items = slides.length ? slides : fallbackHero;

  return (
    <section className="site-hero-images" aria-label="Hero images">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop={items.length > 1}
        speed={900}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="site-hero-swiper"
      >
        {items?.map((slide, index) => {
          const src = slide?.imageUrl
            ? getImageUrl(slide.imageUrl)
            : `/assets/images/${slide?.folder || "banner"}/${slide?.image}`;

          return (
            <SwiperSlide key={slide?._id || `${src}-${index}`}>
              <div className="site-hero-slide">
                <img src={src} alt="" />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

export function AboutPreview({ about, isAboutPage = false }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  const title =
    localize(about?.aboutUsTitle?.title, lang) ||
    localize(about?.title, lang) ||
    t("aboutJadir");
  const text =
    localize(about?.content, lang) ||
    localize(about?.description, lang) ||
    t("weSupport");

  return (
    <section className="site-band site-about-preview">
      <div className="auto-container site-about-split">
        <div className="site-about-media">
          <figure className="site-about-image site-about-image-main">
            <img src="/assets/images/about-2.jpg" alt="" />
          </figure>
          <figure className="site-about-image site-about-image-float">
            <img src="/assets/images/about-1.jpg" alt="" />
          </figure>
          <div className="site-about-badge">
            <strong>{t("jadir")}</strong>
            <span>{t("consultingClearExec")}</span>
          </div>
        </div>
        <div className="site-about-content">
          <SectionTitle
            eyebrow="About"
            title={title}
            text={isAboutPage ? text : truncate(text, 260)}
          />
          <div className="site-about-mini-panel">
            <h3>{t("focusedGrowth")}</h3>
            <p>{isAboutPage ? text : truncate(text, 360)}</p>
          </div>
          {!isAboutPage && (
            <Link className="site-btn" href="/about">
              {t("about.about-us")}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function AboutOverview({ data = {} }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  const about = data.about || {};
  const values = Array.isArray(data.values) ? data.values : [];
  const aboutTitle =
    localize(about?.aboutUsTitle?.title, lang) ||
    localize(about?.title, lang) ||
    t("about.about-us");
  const items = [
    {
      id: "about",
      title: t("about.about-us"),
      content:
        localize(about?.content, lang) || localize(about?.description, lang),
    },
    {
      id: "vision",
      title: localize(about?.vision, lang) || t("vision"),
      content: localize(about?.visionDescription, lang),
    },
    {
      id: "message",
      title: localize(about?.message, lang) || t("message"),
      content: localize(about?.messageDescription, lang),
    },
    {
      id: "values",
      title: t("values"),
      values,
    },
    {
      id: "business-approach",
      title: t("about.businessApproach"),
      content: localize(about?.businessApproach, lang),
    },
    {
      id: "who-we-serve",
      title: t("whoWeServe"),
      content: localize(about?.whoWeServe, lang),
    },
    {
      id: "why-us",
      title: t("why_choose"),
      content: localize(about?.whyUs, lang),
    },
  ];

  return (
    <section className="site-band">
      <div className="auto-container">
        <SectionTitle eyebrow="About" title={aboutTitle} />

        <div className="site-about-overview-grid">
          {items.map((item) => (
            <article className="site-info-panel" key={item.id}>
              <h3>{item.title}</h3>
              {item.id === "values" ? (
                item.values.length ? (
                  <ul className="site-about-value-list">
                    {item.values.map((value) => (
                      <li key={value?._id || localize(value?.name, lang)}>
                        <strong>
                          {localize(value?.name, lang) || "Value"}
                        </strong>
                        <span>
                          {truncate(
                            localize(value?.content, lang) ||
                              localize(value?.description, lang),
                            120,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null
              ) : stripHtml(item.content) ? (
                <div>{parse(item.content)}</div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Statistics({ statistics = [] }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";
  if (!statistics.length) return null;

  return (
    <section className="site-dark-band">
      <div className="auto-container site-stat-grid">
        {statistics.slice(0, 4).map((item) => (
          <div
            className="site-stat"
            key={item?._id || localize(item?.title, lang)}
          >
            <strong>
              {item?.value}
              {localize(item?.suffix, lang)}
            </strong>
            <span>
              {localize(item?.title, lang) || localize(item?.description, lang)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServicesPreview({ services = [] }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  if (!services.length) return null;

  return (
    <section className="site-band site-services-showcase">
      <div className="auto-container">
        <div className="site-title-row">
          <SectionTitle
            eyebrow={t("services.title")}
            title={t("whatCanWeHelp")}
            text={t("servicesSectionTitle")}
          />
          <Link className="site-link" href="/services">
            {t("allServices")}
          </Link>
        </div>

        <div className="site-service-grid">
          {services.slice(0, 6).map((service, index) => (
            <Link
              className="site-service-card"
              href={`/Services/${service?.slug || service?._id}`}
              key={service?._id || service?.slug}
            >
              <span className="site-service-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="site-service-topline" />
              <h3>{localize(service?.title, lang)}</h3>
              <p>{truncate(localize(service?.description, lang), 130)}</p>
              <span className="site-service-arrow" aria-hidden="true">
                <i className="fa-solid fa-arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ConsultCTA() {
  const { t } = useTranslation();
  return (
    <section className="site-cta">
      <div className="site-cta-bg" />

      <div className="auto-container">
        <div className="site-cta-inner">
          <div className="site-cta-content">
            <span className="site-cta-kicker">{t("advisorySupport")}</span>

            <h2>{t("needCustomConsult")}</h2>

            <p>{t("speakWithTeam")}</p>
          </div>

          <Link className="site-cta-btn" href="/contact">
            {t("requestConsult")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TrustedLogos({ partners = [], companies = [] }) {
  const isMobile = useIsMobile();
  const { i18n, t } = useTranslation();

  const lang = i18n.language || "en";
  const isRtl = lang === "ar";

  const partnerItems = partners
    .map((partner) => ({
      id: `partner-${partner?._id || partner?.id}`,
      type: "partner",

      title: localize(partner?.title || partner?.name, lang),

      image: getImageUrl(partner?.imageUrl || partner?.logoUrl),
    }))
    .filter((item) => item.image);

  const companyItems = companies
    .map((company) => ({
      id: `company-${company?._id || company?.id}`,
      type: "company",

      title: localize(company?.name || company?.companyName, lang),

      image: getImageUrl(company?.imageUrl || company?.logoUrl),
    }))
    .filter((item) => item.image);

  const items = [...partnerItems, ...companyItems];

  if (!items.length) {
    return null;
  }

  const repeatedItems =
    items.length > 1 ? [...items, ...items, ...items] : items;

  return (
    <section
      className={`jadwa-trusted-section ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="jadwa-trusted-bg" />

      <div className="auto-container">
        <div className="statistics-head">
          <span className="statistics-subtitle">{t("trustedBy")}</span>

          <h2 className="jadwa-services-title">{t("trustedPartners")}</h2>
        </div>

        <div className="jadwa-trusted-rail">
          <Swiper
            key={`trusted-logos-${lang}-${items.length}`}
            modules={[Autoplay]}
            spaceBetween={isMobile ? 18 : 40}
            slidesPerView={isMobile ? 2 : 3}
            loop={repeatedItems.length > 1}
            speed={5200}
            allowTouchMove={false}
            autoplay={
              repeatedItems.length > 1
                ? {
                    delay: 1,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                  }
                : false
            }
            breakpoints={{
              480: {
                slidesPerView: 2.4,
                spaceBetween: 12,
              },

              640: {
                slidesPerView: 3,
                spaceBetween: 14,
              },

              768: {
                slidesPerView: 4,
                spaceBetween: 16,
              },

              1024: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
            }}
            className="jadwa-trusted-swiper"
          >
            {repeatedItems.map((item, index) => (
              <SwiperSlide key={`${item.id}-${index}`}>
                <div className="jadwa-trusted-logo-card">
                  <img
                    src={item.image}
                    alt={
                      item.title ||
                      (item.type === "company" ? "Company" : "Partner")
                    }
                    loading="lazy"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ testimonials = [] }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";

  if (!testimonials.length) return null;

  const featured = testimonials[0];
  const side = testimonials.slice(1, 3);
  const rest = testimonials.slice(3);

  const getQuote = (item) =>
    localize(item?.quote || item?.content || item?.description, lang);

  const getName = (item) => localize(item?.clientName || item?.name, lang);

  const getRole = (item) => localize(item?.clientRole || item?.role, lang);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const featuredName = getName(featured);

  return (
    <section
      className={`jadir-about-testimonials ${lang === "ar" ? "rtl" : "ltr"}`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="auto-container">
        <div className="statistics-head">
          <span className="statistics-subtitle">{t("about.testimonials")}</span>
          <h2 className="jadwa-services-title">{t("whatClientsSay")}</h2>
          <p className="jadwa-triple-title">{t("trustedPeopleFeedback")}</p>
        </div>

        <div className="jadir-about-testimonials-layout">
          <article className="jadir-about-testimonial-featured">
            <div className="jadir-about-testimonial-quote">"</div>

            <p className="jadir-about-testimonial-featured-text">
              {getQuote(featured)}
            </p>

            <div className="jadir-about-testimonial-person">
              <div className="jadir-about-testimonial-avatar">
                {getInitials(featuredName || "Client")}
              </div>

              <div>
                <h3>{featuredName}</h3>
                {getRole(featured) && <span>{getRole(featured)}</span>}
              </div>
            </div>
          </article>

          {!!side.length && (
            <div className="jadir-about-testimonial-stack">
              {side.map((item) => {
                const name = getName(item);

                return (
                  <article
                    className="jadir-about-testimonial-card"
                    key={item?._id || name}
                  >
                    <div className="jadir-about-testimonial-small-quote">"</div>

                    <p>{truncate(getQuote(item), 150)}</p>

                    <div className="jadir-about-testimonial-person compact">
                      <div className="jadir-about-testimonial-avatar">
                        {getInitials(name || "Client")}
                      </div>

                      <div>
                        <h3>{name}</h3>
                        {getRole(item) && <span>{getRole(item)}</span>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {rest.length > 0 && (
          <div className="jadir-about-testimonial-grid">
            {rest.map((item) => {
              const name = getName(item);

              return (
                <article
                  className="jadir-about-testimonial-card"
                  key={item?._id || name}
                >
                  <div className="jadir-about-testimonial-small-quote">"</div>

                  <p>{truncate(getQuote(item), 150)}</p>

                  <div className="jadir-about-testimonial-person compact">
                    <div className="jadir-about-testimonial-avatar">
                      {getInitials(name || "Client")}
                    </div>

                    <div>
                      <h3>{name}</h3>
                      {getRole(item) && <span>{getRole(item)}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function ProjectCards({ projects = [], limit }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  const isRtl = lang === "ar";
  const items = limit ? projects.slice(0, limit) : projects;

  if (!items.length) return <EmptyState title={t("noProjects")} />;

  return (
    <div className="jadir-service-related-grid">
      {items.map((project) => {
        const href = `/projects/${project?.slug || project?._id}`;
        const title = localize(project?.title, lang);

        return (
          <div
            className="jadir-service-related-card"
            key={project?._id || project?.slug}
          >
            <div className="jadir-service-related-image">
              <img
                src={
                  getImageUrl(project?.imageUrl) ||
                  "/assets/images/project/project-5.jpg"
                }
                alt={title}
              />
            </div>

            <div className="jadir-service-related-content">
              <h3>{title}</h3>
              <p>
                {truncate(
                  localize(project?.brief, lang) ||
                    localize(project?.challenge, lang),
                  120,
                )}
              </p>

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
          </div>
        );
      })}
    </div>
  );
}
export function BlogCards({ blogs = [], limit }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  const items = limit ? blogs.slice(0, limit) : blogs;

  if (!items.length) return <EmptyState title={t("noBlogs")} />;

  return (
    <div className="site-card-grid">
      {items.map((blog) => (
        <Link
          className="site-media-card"
          href={`/blogs/${blog?.slug || blog?._id}`}
          key={blog?._id || blog?.slug}
        >
          <img
            src={
              getImageUrl(blog?.imageUrl) || "/assets/images/news/news-1.jpg"
            }
            alt={localize(blog?.title, lang)}
          />
          <div>
            <span>{localize(blog?.author?.name, lang) || "Jadir"}</span>{" "}
            <h3>{localize(blog?.title, lang)}</h3>
            <p>
              {truncate(
                localize(blog?.excerpt, lang) || localize(blog?.content, lang),
                110,
              )}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function HomeProjects({ projects }) {
  const { t } = useTranslation();
  const items = (projects || []).slice(0, 4);

  return (
    <section className="site-band site-project-showcase">
      <div className="auto-container">
        <SectionTitle eyebrow={t("projeler")} title={t("latestProjects")} />
        <ProjectCards projects={items} />
      </div>
    </section>
  );
}

export function HomeBlogs({ blogs }) {
  const { t } = useTranslation();
  const items = (blogs || []).slice(0, 3);

  return (
    <section className="site-band site-band-soft site-blog-showcase">
      <div className="auto-container">
        <div className="site-title-row">
          <SectionTitle eyebrow={t("blog.Blogs")} title={t("latestInsights")} />
          <Link className="site-link" href="/blogs">
            {t("goToBlogs")}
          </Link>
        </div>
        <BlogCards blogs={items} />
      </div>
    </section>
  );
}

export function AboutTabs({ data }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  const [active, setActive] = useState("team");
  const tabs = [
    { id: "team", label: t("team") },
    { id: "customers", label: t("customersPartners") },
    { id: "statistics", label: t("statistics") },
  ];

  return (
    <section className="site-band">
      <div className="auto-container">
        <div className="site-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={active === tab.id ? "active" : ""}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {active === "team" && (
          <div className="site-card-grid">
            {data.members?.map((member) => (
              <article className="site-person-card" key={member?._id}>
                <img
                  src={
                    getImageUrl(member?.imageUrl) || "/assets/images/team/1.jpg"
                  }
                  alt={localize(member?.name, lang)}
                />
                <h3>{localize(member?.name, lang)}</h3>
                <p>
                  {truncate(
                    localize(
                      member?.brief || member?.description || member?.position,
                      lang,
                    ),
                    120,
                  )}
                </p>
              </article>
            ))}
          </div>
        )}

        {active === "customers" && (
          <div className="site-card-grid">
            {data.companies?.map((company) => (
              <article className="site-card" key={company?._id}>
                <img
                  className="site-card-logo"
                  src={
                    getImageUrl(company?.logoUrl) ||
                    "/assets/images/logos/jadir.png"
                  }
                  alt={localize(company?.companyName, lang)}
                />
                <h3>{localize(company?.companyName, lang)}</h3>
                <p>
                  {truncate(
                    localize(
                      company?.about || company?.content || company?.aboutus,
                      lang,
                    ),
                    150,
                  )}
                </p>
              </article>
            ))}
          </div>
        )}

        {active === "statistics" && <Statistics statistics={data.statistics} />}
      </div>
    </section>
  );
}

export function ServiceRequestModal({ service, onClose }) {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  async function submit(event) {
    event.preventDefault();
    await fetch(`${baseURL}messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        subject: `Service request: ${localize(service?.title, "en")}`,
        requestType: "service-request",
        service: service?._id,
      }),
    }).catch(() => null);
    setSent(true);
  }

  return (
    <div className="site-modal" role="dialog" aria-modal="true">
      <div className="site-modal-card">
        <button
          className="site-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark" />
        </button>
        {sent ? (
          <div className="site-thanks">
            <h2>{t("thankYou")}</h2>
            <p>{t("serviceRequestSent")}</p>
          </div>
        ) : (
          <form className="site-form" onSubmit={submit}>
            <h2>{t("requestService")}</h2>
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <textarea
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button className="site-btn" type="submit">
              {t("sendRequest")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function BlogFilters({ blogs = [], categories = [] }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    return blogs.filter((blog) => {
      const titleMatch = localize(blog?.title, lang)
        .toLowerCase()
        .includes(query.toLowerCase());
      const categoryMatch =
        !category ||
        blog?.category?._id === category ||
        blog?.category === category;
      const tagMatch =
        !query ||
        (blog?.tags || []).some((tag) =>
          localize(tag, lang).toLowerCase().includes(query.toLowerCase()),
        );
      return (titleMatch || tagMatch) && categoryMatch;
    });
  }, [blogs, category, lang, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="site-toolbar">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={t("searchTitleTag")}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((item) => (
            <option key={item?._id} value={item?._id}>
              {localize(item?.name || item?.title, lang)}
            </option>
          ))}
        </select>
      </div>
      <BlogCards blogs={visible} />
      <div className="site-pagination">
        {Array.from({ length: pages }, (_, index) => (
          <button
            key={index + 1}
            type="button"
            className={page === index + 1 ? "active" : ""}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
}

export function BlogDetails({ blog, related = [] }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language || "en";
  const title = localize(blog?.title, lang);
  const content = localize(blog?.content, lang);

  return (
    <section className="site-band">
      <div className="auto-container site-detail-layout">
        <main className="site-detail-main">
          <img
            className="site-detail-image"
            src={
              getImageUrl(blog?.imageUrl) || "/assets/images/news/news-1.jpg"
            }
            alt={title}
          />
          <h1>{title}</h1>
          <div className="site-detail-meta">
            <span>{localize(blog?.author?.name, lang) || "Jadir"}</span>{" "}
            <span>{formatDate(blog?.createdAt)}</span>
          </div>
          <article className="site-richtext">{parse(content || "")}</article>
        </main>
        <aside className="site-detail-side">
          <div className="site-card">
            <h3>{t("tags")}</h3>
            <div className="site-tags">
              {(blog?.tags || []).map((tag, index) => (
                <span key={index}>{localize(tag, lang)}</span>
              ))}
            </div>
          </div>
          <div className="site-card">
            <h3>{t("share")}</h3>
            <ShareArticle
              title={title}
              description={stripHtml(content).slice(0, 120)}
            />
          </div>
          <div className="site-card">
            <h3>{t("relatedBlogs")}</h3>
            {related.map((item) => (
              <Link
                href={`/blogs/${item?.slug || item?._id}`}
                key={item?._id || item?.slug}
              >
                {localize(item?.title, lang)}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export function ContactExperience({ contact = {}, services = [] }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    requestType: "consult-inquiry",
    service: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const branches = Array.isArray(contact?.branches) ? contact.branches : [];

  async function submit(event) {
    event.preventDefault();
    await fetch(`${baseURL}messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    setSent(true);
  }

  if (sent) {
    return (
      <section className="site-band">
        <div className="auto-container site-thanks">
          <h1>{t("thankYou")}</h1>
          <p>{t("messageReceived")}</p>
          <Link className="site-btn" href="/">
            {t("backToHome")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="site-band">
      <div className="auto-container site-contact-grid">
        <form className="site-form" onSubmit={submit}>
          <h2>{t("contact.formTitle")}</h2>
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            value={form.requestType}
            onChange={(e) => setForm({ ...form, requestType: e.target.value })}
          >
            <option value="consult-inquiry">{t("consultInquiry")}</option>
            <option value="partnership">{t("partnership")}</option>
            <option value="media">{t("media")}</option>
            <option value="support">{t("support")}</option>
            <option value="service-request">{t("serviceRequest")}</option>
            <option value="complaint">{t("complaint")}</option>
          </select>
          {form.requestType === "service-request" ? (
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
            >
              <option value="">{t("selectService")}</option>
              {services.map((service) => (
                <option key={service?._id} value={service?._id}>
                  {localize(service?.title, "en")}
                </option>
              ))}
            </select>
          ) : null}
          <textarea
            required
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <button className="site-btn" type="submit">
            {t("contact.submit")}
          </button>
        </form>

        <div className="site-info-panel">
          <h2>{t("companyBranches")}</h2>
          <p>{localize(contact?.address, "en")}</p>
          {contact?.mapLink ? (
            <a href={contact.mapLink} target="_blank" rel="noreferrer">
              {t("openMainBranch")}
            </a>
          ) : null}
          {contact?.whatsapp ? (
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("whatsappSupport")}: {contact.whatsapp}
            </a>
          ) : null}
          {(contact?.phones || []).map((phone) => (
            <a key={phone} href={`tel:${phone.replace(/\s+/g, "")}`}>
              {phone}
            </a>
          ))}
          {branches.map((branch) => (
            <div className="site-branch" key={branch?._id}>
              <h3>{localize(branch?.name, "en")}</h3>
              <p>{localize(branch?.address, "en")}</p>
              {(branch?.phones || []).map((phone) => (
                <a key={phone} href={`tel:${phone.replace(/\s+/g, "")}`}>
                  {phone}
                </a>
              ))}
              {branch?.mapLink ? (
                <a href={branch.mapLink} target="_blank" rel="noreferrer">
                  {t("branchLink")}
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FooterLinks({ policies = [] }) {
  return policies.length
    ? policies.map((policy) => (
        <li key={policy?._id || policy?.slug}>
          <Link href={`/policies/${policy?.slug}`}>
            {localize(policy?.title, "en")}
          </Link>
        </li>
      ))
    : siteLinks.map((link) => (
        <li key={link.href}>
          <Link href={link.href}>{link.label}</Link>
        </li>
      ));
}
