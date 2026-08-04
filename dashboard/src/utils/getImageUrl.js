import { imageURL } from "../api/globalData";

const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = imageURL.replace(/\/+$/, "");

  const normalizedPath = path.replace(/\\/g, "/").replace(/^\/+/, "");

  return `${baseUrl}/${normalizedPath}`;
};

export default getImageUrl;
