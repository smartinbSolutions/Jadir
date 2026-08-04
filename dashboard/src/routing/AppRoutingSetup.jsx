import ProtectedRoute from "./ProtectedRoute";
import { Navigate, Route, Routes } from "react-router";
import { DefaultPage } from "@/pages/dashboards";

import { AuthPage } from "@/auth";
import { Demo6Layout } from "@/layouts/demo6";
import { ErrorsRouting } from "@/errors";

//Blog
import AllBlogs from "../modules/Blogs/blog/components/allBlogs";
import AddBlog from "../modules/Blogs/blog/components/AddBlog";
import AllCateogryBlogs from "../modules/Blogs/BlogCategory/components/AllCateogryBlogs";
import UpdateBlog from "../modules/Blogs/blog/components/UpdateBlog";
import AllHomeSliders from "../modules/home/components/AllHomeSliders";
import AddHomeSlider from "../modules/home/components/AddHomeSlider";
import UpdateHomeSlider from "../modules/home/components/UpdateHomeSlider";
import AllPartners from "../modules/partners/components/AllPartners";
import AddPartner from "../modules/partners/components/AddPartner";
import UpdatePartner from "../modules/partners/components/UpdatePartner";
import AllValues from "../modules/Values/components/AllValues";
import AddValue from "../modules/Values/components/AddValue";
import UpdateValue from "../modules/Values/components/UpdateValue";
import EditAboutHome from "../modules/home/about/components/EditAboutHome";
import EditFooter from "../modules/Footer/components/EditFooter";
import AllMessages from "../modules/Messages/components/AllMessages";
import EditContactUs from "../modules/ContactUs/components/EditContactUs";
import AllUsers from "../modules/Users/components/AllUsers";
import AddUser from "../modules/Users/components/AddUser";
import UpdateUser from "../modules/Users/components/UpdateUser";
import AllCompanies from "../modules/Companies/components/AllCompanies";
import AddCompany from "../modules/Companies/components/AddCompany";
import UpdateCompany from "../modules/Companies/components/UpdateCompany";
import AllBoardMembers from "../modules/BoardMembers/components/AllBoardMembers";
import AddBoardMember from "../modules/BoardMembers/components/AddBoardMember";
import UpdateBoardMember from "../modules/BoardMembers/components/UpdateBoardMember";
import AllSectors from "../modules/sectors/components/AllSectors";
import AddSector from "../modules/sectors/components/AddSector";
import UpdateSector from "../modules/sectors/components/UpdateSector";
import AboutServices from "../modules/aboutServices/components/AboutServices";
import AllOurServices from "../modules/OurServices/components/AllOurServices";
import AddOurService from "../modules/OurServices/components/AddOurService";
import UpdateOurService from "../modules/OurServices/components/UpdateOurService";
import AllProjects from "../modules/projects/components/AllProjects";
import AddProject from "../modules/projects/components/AddProject";
import UpdateProject from "../modules/projects/components/UpdateProject";
import AllStatistics from "../modules/statistics/components/AllStatistics";
import AddStatistic from "../modules/statistics/components/AddStatistic";
import UpdateStatistic from "../modules/statistics/components/UpdateStatistic";
import AllTestimonials from "../modules/Testimonials/components/AllTestimonials";
import AddTestimonial from "../modules/Testimonials/components/AddTestimonial";
import UpdateTestimonial from "../modules/Testimonials/components/UpdateTestimonial";
import AllPolicies from "../modules/Policies/components/AllPolicies";
import AddPolicy from "../modules/Policies/components/AddPolicy";
import UpdatePolicy from "../modules/Policies/components/UpdatePolicy";
import AllCareers from "../modules/Careers/components/AllCareers";
import AddCareer from "../modules/Careers/components/AddCareer";
import UpdateCareer from "../modules/Careers/components/UpdateCareer";
import CareerApplications from "../modules/Careers/components/CareerApplications";
import EditPageBanners from "../modules/PageBanners/components/EditPageBanners";
import ReplyMessage from "../modules/Messages/components/ReplyMessage";

const AppRoutingSetup = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute redirectTo="/auth/login" />}>
        <Route element={<Demo6Layout />}>
          <Route path="/" element={<DefaultPage />} />

          {/* Blogs */}
          <Route path="/all-blogs" element={<AllBlogs />} />
          <Route path="/add-blog" element={<AddBlog />} />
          <Route path="/update-blog/:id" element={<UpdateBlog />} />

          {/* Categories */}
          <Route path="/categories" element={<AllCateogryBlogs />} />

          {/* Home sliders */}
          <Route path="/all-home-sliders" element={<AllHomeSliders />} />
          <Route path="/add-home-slider" element={<AddHomeSlider />} />
          <Route
            path="/update-home-slider/:id"
            element={<UpdateHomeSlider />}
          />

          {/* Home about */}
          <Route path="/edit-about-home" element={<EditAboutHome />} />

          {/* Partners */}
          <Route path="/all-partners" element={<AllPartners />} />
          <Route path="/add-partner" element={<AddPartner />} />
          <Route path="/update-partner/:id" element={<UpdatePartner />} />

          {/* Values */}
          <Route path="/all-values" element={<AllValues />} />
          <Route path="/add-value" element={<AddValue />} />
          <Route path="/update-value/:id" element={<UpdateValue />} />

          {/* Footer */}
          <Route path="/edit-footer" element={<EditFooter />} />

          {/* Messages */}
          <Route path="/all-messages" element={<AllMessages />} />
          <Route path="/reply-message/:id" element={<ReplyMessage />} />

          {/* Contact Us */}
          <Route path="/edit-contact-us" element={<EditContactUs />} />

          {/* Users */}
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/update-user/:id" element={<UpdateUser />} />

          {/* Companies */}
          {/* <Route path="/all-companies" element={<AllCompanies />} />
          <Route path="/add-company" element={<AddCompany />} />
          <Route path="/update-company/:id" element={<UpdateCompany />} /> */}

          {/* Board memners */}
          <Route path="/all-board-members" element={<AllBoardMembers />} />
          <Route path="/add-board-member" element={<AddBoardMember />} />
          <Route
            path="/update-board-member/:id"
            element={<UpdateBoardMember />}
          />

          {/* Sectors */}
          {/* <Route path="/all-sectors" element={<AllSectors />} />
          <Route path="/add-sector" element={<AddSector />} />
          <Route path="/update-sector/:id" element={<UpdateSector />} /> */}

          {/* About services */}
          <Route path="/about-services" element={<AboutServices />} />

          {/* Our services */}
          <Route path="/all-our-services" element={<AllOurServices />} />
          <Route path="/add-our-service" element={<AddOurService />} />
          <Route
            path="/update-our-service/:id"
            element={<UpdateOurService />}
          />

          {/* Projects */}
          <Route path="/all-projects" element={<AllProjects />} />
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/update-project/:id" element={<UpdateProject />} />

          {/* Testimonials */}
          <Route path="/all-testimonials" element={<AllTestimonials />} />
          <Route path="/add-testimonial" element={<AddTestimonial />} />
          <Route
            path="/update-testimonial/:id"
            element={<UpdateTestimonial />}
          />

          {/* Policies */}
          <Route path="/all-policies" element={<AllPolicies />} />
          <Route path="/add-policy" element={<AddPolicy />} />
          <Route path="/update-policy/:id" element={<UpdatePolicy />} />

          {/* Statistics */}
          <Route path="/all-statistics" element={<AllStatistics />} />
          <Route path="/add-statistic" element={<AddStatistic />} />
          <Route path="/update-statistic/:id" element={<UpdateStatistic />} />

          {/* Careers */}
          <Route path="/careers" element={<AllCareers />} />
          <Route path="/add-career" element={<AddCareer />} />
          <Route path="/update-career/:id" element={<UpdateCareer />} />
          <Route
            path="/career-applications/:careerId"
            element={<CareerApplications />}
          />

          {/* Page banners */}
          <Route path="/page-banners" element={<EditPageBanners />} />
        </Route>
      </Route>

      {/* General pages */}
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
