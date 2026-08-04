import { useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router";
import { useLoaders } from "@/providers";
import { AppRoutingSetup } from ".";

const APP_TITLE = "Jadir Dashboard";

const PAGE_TITLES = [
  { path: "/", title: "Overview" },
  { path: "/all-blogs", title: "Blogs" },
  { path: "/add-blog", title: "Add Blog" },
  { path: "/update-blog/:id", title: "Update Blog" },
  { path: "/categories", title: "Blog Categories" },
  { path: "/all-home-sliders", title: "Home Sliders" },
  { path: "/add-home-slider", title: "Add Home Slider" },
  { path: "/update-home-slider/:id", title: "Update Home Slider" },
  { path: "/edit-about-home", title: "Home About" },
  { path: "/all-partners", title: "Partners" },
  { path: "/add-partner", title: "Add Partner" },
  { path: "/update-partner/:id", title: "Update Partner" },
  { path: "/all-values", title: "Values" },
  { path: "/add-value", title: "Add Value" },
  { path: "/update-value/:id", title: "Update Value" },
  { path: "/edit-footer", title: "Footer" },
  { path: "/all-messages", title: "Messages" },
  {
    path: "/reply-message/:id",
    title: "Reply to Message",
  },
  { path: "/edit-contact-us", title: "Contact Info" },
  { path: "/all-users", title: "Users" },
  { path: "/add-user", title: "Add User" },
  { path: "/update-user/:id", title: "Update User" },
  { path: "/all-board-members", title: "Team Members" },
  { path: "/add-board-member", title: "Add Team Member" },
  { path: "/update-board-member/:id", title: "Update Team Member" },
  { path: "/about-services", title: "About Services" },
  { path: "/all-our-services", title: "Services" },
  { path: "/add-our-service", title: "Add Service" },
  { path: "/update-our-service/:id", title: "Update Service" },
  { path: "/all-projects", title: "Projects" },
  { path: "/add-project", title: "Add Project" },
  { path: "/update-project/:id", title: "Update Project" },
  { path: "/all-testimonials", title: "Testimonials" },
  { path: "/add-testimonial", title: "Add Testimonial" },
  { path: "/update-testimonial/:id", title: "Update Testimonial" },
  { path: "/all-policies", title: "Policies" },
  { path: "/add-policy", title: "Add Policy" },
  { path: "/update-policy/:id", title: "Update Policy" },
  { path: "/all-statistics", title: "Statistics" },
  { path: "/add-statistic", title: "Add Statistic" },
  { path: "/update-statistic/:id", title: "Update Statistic" },
  { path: "/page-banners", title: "Page Banners" },
  { path: "/auth/login", title: "Login" },
  { path: "/error/404", title: "Page Not Found" },
  { path: "/error/500", title: "Server Error" },
];

const getPageTitle = (pathname) => {
  const matchedRoute = PAGE_TITLES.find(({ path }) =>
    matchPath({ path, end: true }, pathname),
  );

  return matchedRoute?.title || "Page";
};

const AppRouting = () => {
  const { setProgressBarLoader } = useLoaders();
  const [previousLocation, setPreviousLocation] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const location = useLocation();
  const path = location.pathname.trim();

  useEffect(() => {
    document.title = `${getPageTitle(path)} | ${APP_TITLE}`;
  }, [path]);

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    if (!firstLoad) {
      setProgressBarLoader(true);
      setPreviousLocation(path);
      setProgressBarLoader(false);

      if (path === previousLocation) {
        setPreviousLocation("");
      }
    }
  }, [location]);

  useEffect(() => {
    if (!CSS.escape(window.location.hash)) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [previousLocation]);

  return <AppRoutingSetup />;
};

export { AppRouting };
