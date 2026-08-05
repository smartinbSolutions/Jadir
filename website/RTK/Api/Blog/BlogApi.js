import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseURL, { BlogsEndPoint } from "@/api/GlobalData";

export const BlogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
  }),
  tagTypes: ["blog"],
  endpoints: (builder) => ({
    // ✅ Get all blogs
    getAllBlogs: builder.query({
      query: ({
        keyword = "",
        page = 1,
        limit = 10,
        CategoryId = "",
        published = true,
      } = {}) => {
        const params = new URLSearchParams();

        if (keyword) params.append("keyword", keyword);
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (CategoryId) params.append("category", CategoryId.toString());
        if (published) params.append("published", published.toString());
        return `${BlogsEndPoint}/public?${params.toString()}`;
      },
      providesTags: ["blog"],
    }),

    // ✅ Get one blog by ID
    getOneBlogById: builder.query({
      query: (id) => `${BlogsEndPoint}/${id}`,
      providesTags: ["blog"],
    }),
    // ✅ Get one blog by Category Id
    getBlogsByCategory: builder.query({
      query: (slug) => `${BlogsEndPoint}/blog_categories/${slug}`,
      providesTags: ["blog"],
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetOneBlogByIdQuery,
  useGetBlogsByCategoryQuery,
} = BlogApi;
