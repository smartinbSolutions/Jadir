import { fetchJSON, pickArray, pickObject } from "../GlobalHooks/GlobalHooks";

import baseURL, {
  AboutHomeEndPoint,
  BlogsEndPoint,
  CompaniesPublicEndPoint,
  HomeSliderEndPoint,
  InvestmentFundsEndPoint,
  OurServicesEndPoint,
  PartnersEndPoint,
  ProjectsEndPoint,
  SectorsEndPoint,
  StatisticsEndPoint,
  ValuesEndPoint,
} from "@/api/GlobalData";

import {
  normalizeBlog,
  normalizeCompany,
  normalizeFund,
  normalizeStatistic,
} from "@/api/serverData";

export async function getHomeData() {
  const urls = [
    `${baseURL}${HomeSliderEndPoint}/public/list?sliderType=main&isActive=true`, // 0
    `${baseURL}${AboutHomeEndPoint}`, // 1
    `${baseURL}${OurServicesEndPoint}/public`, // 2
    `${baseURL}${SectorsEndPoint}/public`, // 3
    `${baseURL}${BlogsEndPoint}/public?limit=10`, // 4
    `${baseURL}${ProjectsEndPoint}`, // 5
    `${baseURL}${InvestmentFundsEndPoint}/public`, // 6
    `${baseURL}${StatisticsEndPoint}`, // 7
    `${baseURL}${PartnersEndPoint}/public`, // 8
    `${baseURL}${ValuesEndPoint}/public`, // 9
    `${baseURL}${CompaniesPublicEndPoint}`, // 10
  ];

  const results = await Promise.allSettled(urls.map((url) => fetchJSON(url)));

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to fetch home data from: ${urls[index]}`,
        result.reason,
      );
    }
  });

  const safe = (index, fallback = []) =>
    results[index]?.status === "fulfilled" ? results[index].value : fallback;

  return {
    banners: pickArray(safe(0)),
    about: pickObject(safe(1, {})),
    services: pickArray(safe(2)),
    sectors: pickArray(safe(3)),
    news: pickArray(safe(4)).map(normalizeBlog),
    projects: pickArray(safe(5)),
    funds: pickArray(safe(6)).map(normalizeFund),
    statistics: pickArray(safe(7)).map(normalizeStatistic),
    partners: pickArray(safe(8)),
    values: pickArray(safe(9)),
    companies: pickArray(safe(10)).map(normalizeCompany),
  };
}
