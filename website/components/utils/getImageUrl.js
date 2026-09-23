import { imageURL } from "@/api/GlobalData";

const getImageUrl = (path) => {
  if (!path) return "";

  if (path.startsWith("http")) {
    return path;
  }

  // normalize: strip trailing slash from base, ensure single leading slash on path
  const base = imageURL.endsWith("/") ? imageURL.slice(0, -1) : imageURL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
};

export default getImageUrl;
