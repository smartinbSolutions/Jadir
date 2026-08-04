import Layout from "@/components/layout/Layout";
import Banner from "@/components/sections/home1/Banner";
import About from "@/components/sections/home3/About";
import Statistics from "@/components/sections/home3/Statistics";
import News from "@/components/sections/home2/News";
import Services from "@/components/sections/home3/Services";
import TestimonialSlider03 from "@/components/slider/TestimonialSlider03";
import { ConsultCTA, TrustedLogos } from "@/components/website/PublicSections";

import { getHomeData } from "@/api/getHomeData";
import { getOtherData } from "@/api/getOtherData";

export async function getStaticProps() {
  try {
    const [data, otherData] = await Promise.all([
      getHomeData(),

      getOtherData({
        includeCompanies: false,
      }),
    ]);

    return {
      props: {
        data,
        otherData,
      },

      revalidate: 300,
    };
  } catch (error) {
    console.error("Home data error:", error);

    return {
      props: {
        data: {},
        otherData: {},
      },

      revalidate: 300,
    };
  }
}

export default function Home({ data = {}, otherData = {} }) {
  const {
    banners = [],
    about = {},
    partners = [],
    companies = [],
    news = [],
    statistics = [],
    services = [],
  } = data;

  const { testimonials = [] } = otherData;

  return (
    <div className="homePage">
      <Layout>
        <Banner HomeSlides={banners} />

        <About aboutUs={about} ishomePage={true} />

        <Statistics statistics={statistics} />

        <Services services={services} />

        <ConsultCTA />

        <TrustedLogos partners={partners} companies={companies} />

        <TestimonialSlider03 testimonials={testimonials} />

        <News news={news} />
      </Layout>
    </div>
  );
}
