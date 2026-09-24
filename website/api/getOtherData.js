import { fetchJSON, pickArray, pickObject } from "../GlobalHooks/GlobalHooks";

import baseURL, {
  AboutHomeEndPoint,
  AboutServicesEndPoint,
  BlogsEndPoint,
  BoardMembersEndPoint,
  CategoriesEndPoint,
  CompaniesPublicEndPoint,
  CustomPagesEndPoint,
  InvestmentFundsEndPoint,
  OurServicesEndPoint,
  PlansEndPoint,
  ProjectsEndPoint,
  ResearchEndPoint,
  StatisticsEndPoint,
  TestimonialsEndPoint,
} from "@/api/GlobalData";

import {
  normalizeBlog,
  normalizeBoardMember,
  normalizeCompany,
  normalizeFund,
  normalizeStatistic,
} from "@/api/serverData";

import { getPageBanners } from "@/lib/pageBanners";

export async function getAllBlogs({
  page = 1,
  limit = 10,
  CategoryId = "",
  keyword = "",
  published = true,
} = {}) {
  const params = new URLSearchParams();

  if (keyword) {
    params.append("keyword", keyword);
  }

  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (CategoryId) {
    params.append("category", CategoryId.toString());
  }

  if (published) {
    params.append("published", published.toString());
  }

  try {
    const response = await fetch(
      `${baseURL}${BlogsEndPoint}/public?${params.toString()}`,
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch blogs: ${response.status} ${response.statusText}`,
      );

      return {
        data: [],
        pagination: {
          totalPages: 0,
        },
      };
    }

    const payload = await response.json();

    return {
      ...payload,
      data: pickArray(payload).map(normalizeBlog),
    };
  } catch (error) {
    console.error("Failed to fetch blogs:", error);

    return {
      data: [],
      pagination: {
        totalPages: 0,
      },
    };
  }
}

export async function getBlogBySlug(slug) {
  if (!slug) {
    return null;
  }

  try {
    const payload = await fetchJSON(
      `${baseURL}${BlogsEndPoint}/public/slug/${encodeURIComponent(slug)}`,
    );

    return normalizeBlog(payload?.data || {});
  } catch (error) {
    console.error("Failed to fetch blog by slug:", error);
    return null;
  }
}

export async function getRelatedBlogs({ blog, lang = "en", limit = 3 } = {}) {
  if (!blog) {
    return [];
  }

  const categoryId = blog?.category?._id || blog?.category;
  const excludeId = blog?._id;

  const selectUnique = (items = []) => {
    const seen = new Set();

    return items.filter((item) => {
      const id = item?._id || item?.slug;

      if (!id || id === excludeId || seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });
  };

  const scoreRelated = (items = []) =>
    [...items].sort((a, b) => {
      const aHasLanguage = Boolean(a?.content?.[lang] || a?.title?.[lang]);

      const bHasLanguage = Boolean(b?.content?.[lang] || b?.title?.[lang]);

      return Number(bHasLanguage) - Number(aHasLanguage);
    });

  try {
    const categoryBlogs = categoryId
      ? await getAllBlogs({
          page: 1,
          limit: limit + 4,
          CategoryId: categoryId,
        })
      : {
          data: [],
        };

    let relatedBlogs = scoreRelated(selectUnique(categoryBlogs?.data || []));

    if (relatedBlogs.length < limit) {
      const fallbackBlogs = await getAllBlogs({
        page: 1,
        limit: limit + 6,
      });

      const fallback = scoreRelated(selectUnique(fallbackBlogs?.data || []));

      relatedBlogs = selectUnique([...relatedBlogs, ...fallback]);
    }

    return relatedBlogs.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch related blogs:", error);
    return [];
  }
}

export async function getAllCategories({ keyword = "" } = {}) {
  const params = new URLSearchParams();

  if (keyword) {
    params.append("keyword", keyword);
  }

  try {
    const response = await fetch(
      `${baseURL}${CategoriesEndPoint}/public?${params.toString()}`,
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch categories: ${response.status} ${response.statusText}`,
      );

      return {
        data: [],
      };
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    return {
      data: [],
    };
  }
}

export async function getOtherData({ includeCompanies = true } = {}) {
  const requests = {
    aboutUs: `${baseURL}${AboutHomeEndPoint}`,
    aboutService: `${baseURL}${AboutServicesEndPoint}`,
    servicesList: `${baseURL}${OurServicesEndPoint}/public`,
    plans: `${baseURL}${PlansEndPoint}/public`,
    funds: `${baseURL}${InvestmentFundsEndPoint}/public`,
    members: `${baseURL}${BoardMembersEndPoint}/public`,
    statistics: `${baseURL}${StatisticsEndPoint}`,
    projects: `${baseURL}${ProjectsEndPoint}`,
    research: `${baseURL}${ResearchEndPoint}`,
    customPages: `${baseURL}${CustomPagesEndPoint}`,
    testimonials: `${baseURL}${TestimonialsEndPoint}`,
  };

  if (includeCompanies) {
    requests.companies = `${baseURL}${CompaniesPublicEndPoint}`;
  }

  const requestEntries = Object.entries(requests);

  const [results, pageBanners] = await Promise.all([
    Promise.allSettled(requestEntries.map(([, url]) => fetchJSON(url))),

    getPageBanners().catch((error) => {
      console.error("Failed to fetch page banners:", error);
      return {};
    }),
  ]);

  const responseData = {};

  results.forEach((result, index) => {
    const [key, url] = requestEntries[index];

    if (result.status === "fulfilled") {
      responseData[key] = result.value;
      return;
    }

    console.error(`Failed to fetch other data from: ${url}`, result.reason);
  });

  const safe = (key, fallback = []) =>
    Object.prototype.hasOwnProperty.call(responseData, key)
      ? responseData[key]
      : fallback;

  return {
    aboutUs: pickObject(safe("aboutUs", {})),
    aboutService: pickObject(safe("aboutService", {})),
    servicesList: pickArray(safe("servicesList")),
    plans: pickArray(safe("plans")),

    companies: includeCompanies
      ? pickArray(safe("companies")).map(normalizeCompany)
      : [],

    funds: pickArray(safe("funds")).map(normalizeFund),

    members: pickArray(safe("members")).map(normalizeBoardMember),

    statistics: pickArray(safe("statistics")).map(normalizeStatistic),

    projects: pickArray(safe("projects")),
    research: pickArray(safe("research")),
    customPages: pickArray(safe("customPages")),
    testimonials: pickArray(safe("testimonials")),
    pageBanners,
    investPortfolio: {},
  };
}
