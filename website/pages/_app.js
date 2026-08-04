import { Noto_Kufi_Arabic } from "next/font/google";

import AppShell from "@/components/AppShell";
import "../i18n";
import "./global.css";
import "../components/layout/header/Header.css";
import "../components/layout/footer/footer.css";
import "../pages/about/about-us.css";
import "../pages/blogs/blogs.css";
import "../pages/blogs/blog-details.css";
import "../pages/contact/contact-us.css";
import "../pages/policies/policies.css";
import "./website.css";
import "./utils.css";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-noto-kufi-arabic",
});

function MyApp({ Component, pageProps }) {
  return (
    <div className={`${notoKufiArabic.variable} noto-kufi-app`}>
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
    </div>
  );
}

export default MyApp;
