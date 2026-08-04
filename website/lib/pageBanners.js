import baseURL, { PageBannersEndPoint } from "@/api/GlobalData";

import { fetchJSON, pickObject } from "@/GlobalHooks/GlobalHooks";

import getImageUrl from "@/components/utils/getImageUrl";

export const PAGE_BANNER_DEFAULTS = {
  about: "/assets/images/background/partners.png",

  services: "/assets/images/background/services.png",

  projects: "/assets/images/background/partners.png",

  blogs: "/assets/images/background/blogs.png",

  careers: "/assets/images/background/partners.png",

  search: "/assets/search-bg.jpg",

  contact: "/assets/images/background/partners.png",

  policies: "/assets/images/background/partners.png",
};

export const toBannerImageUrl = (value = "") => {
  if (!value || typeof value !== "string") {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Backend virtual:
  // /uploads/page-banners/image.webp
  if (value.startsWith("/uploads/")) {
    return getImageUrl(value);
  }

  // uploads/page-banners/image.webp
  if (value.startsWith("uploads/")) {
    return getImageUrl(`/${value}`);
  }

  // Frontend local assets
  if (value.startsWith("/assets/")) {
    return value;
  }

  // Stored backend value:
  // page-banners/image.webp
  return getImageUrl(`/uploads/${value}`);
};

export async function getPageBanners() {
  try {
    const payload = await fetchJSON(`${baseURL}${PageBannersEndPoint}/public`);

    return pickObject(payload);
  } catch (error) {
    console.error("Failed to fetch page banners:", error);

    return {};
  }
}

export function resolvePageBanner(pageKey, pageBanners = {}) {
  const configuredPath =
    pageBanners?.imageUrls?.[pageKey] || pageBanners?.[pageKey] || "";

  const configuredBanner = toBannerImageUrl(configuredPath);

  return configuredBanner || PAGE_BANNER_DEFAULTS[pageKey] || "";
}
