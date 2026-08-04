import baseURL, { imageURL } from "@/api/GlobalData";

import { fetchJSON, pickArray, pickObject } from "@/GlobalHooks/GlobalHooks";

import {
  normalizeBlog,
  normalizeBoardMember,
  normalizeCompany,
  normalizeStatistic,
} from "@/api/serverData";

const API_BASE_URL = String(baseURL || "").replace(/\/+$/, "");

const apiUrl = (endpoint = "") => {
  const cleanEndpoint = String(endpoint).replace(/^\/+/, "");

  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const siteLinks = [
  { href: "/", label: "home" },
  { href: "/about", label: "navAbout" },
  {
    href: "/Services",
    label: "services.title",
  },
  { href: "/projects", label: "projects" },
  { href: "/blogs", label: "blog.Blogs" },
  { href: "/career", label: "navCareer" },
  { href: "/policies", label: "policies" },
  { href: "/contact", label: "navContact" },
];

export const localize = (value, lang = "en") => {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return value[lang] || value.en || value.ar || value.tr || "";
};

export const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const truncate = (value = "", length = 150) => {
  const clean = stripHtml(value);

  return clean.length > length ? `${clean.slice(0, length).trim()}...` : clean;
};

export const asset = (
  folder,
  filename,
  fallback = "/assets/images/news/news-1.jpg",
) => (filename ? `${imageURL}${folder}/${filename}` : fallback);

export async function safeFetch(url, fallback) {
  try {
    return await fetchJSON(url);
  } catch (error) {
    console.error(`Failed to fetch: ${url}`, error);

    return fallback;
  }
}

export async function getWebsiteData() {
  const urls = {
    sliders: apiUrl("home-slider/public/list?sliderType=main&isActive=true"),

    about: apiUrl("about-home"),

    services: apiUrl("our-services/public"),

    values: apiUrl("values/public"),

    partners: apiUrl("partners/public"),

    statistics: apiUrl("statistics/public"),

    testimonials: apiUrl("testimonials/public"),

    projects: apiUrl("projects/public"),

    blogs: apiUrl("blog/public?limit=12&published=true"),

    categories: apiUrl("categories/public"),

    members: apiUrl("board-member/public"),

    companies: apiUrl("companies/public"),

    policies: apiUrl("policies/public"),

    contact: apiUrl("contact-us/public"),

    footer: apiUrl("footer"),
  };

  const entries = await Promise.all(
    Object.entries(urls).map(async ([key, url]) => [
      key,
      await safeFetch(url, null),
    ]),
  );

  const data = Object.fromEntries(entries);

  return {
    sliders: pickArray(data.sliders),

    about: pickObject(data.about),

    services: pickArray(data.services),

    values: pickArray(data.values),

    partners: pickArray(data.partners),

    statistics: pickArray(data.statistics).map(normalizeStatistic),

    testimonials: pickArray(data.testimonials),

    projects: pickArray(data.projects),

    blogs: pickArray(data.blogs).map(normalizeBlog),

    categories: pickArray(data.categories),

    members: pickArray(data.members).map(normalizeBoardMember),

    companies: pickArray(data.companies).map(normalizeCompany),

    policies: pickArray(data.policies),

    contact: pickObject(data.contact),

    footer: pickObject(data.footer),
  };
}

export async function getServiceBySlug(slug) {
  if (!slug) return null;

  const payload = await safeFetch(apiUrl("our-services/public"), []);

  return pickArray(payload).find((item) => item?.slug === slug) || null;
}

export async function getProjectBySlug(slug) {
  if (!slug) return null;

  const payload = await safeFetch(
    apiUrl(`projects/public/slug/${encodeURIComponent(slug)}`),
    null,
  );

  return payload?.data || null;
}

export async function getBlogBySlug(slug) {
  if (!slug) return null;

  const payload = await safeFetch(
    apiUrl(`blog/public/slug/${encodeURIComponent(slug)}`),
    null,
  );

  return payload?.data ? normalizeBlog(payload.data) : null;
}

export async function getPolicyBySlug(slug) {
  if (!slug) return null;

  const payload = await safeFetch(
    apiUrl(`policies/public/slug/${encodeURIComponent(slug)}`),
    null,
  );

  return payload?.data || null;
}
