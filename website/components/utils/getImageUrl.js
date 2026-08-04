import { imageURL } from "@/api/GlobalData";

const getImageUrl = (path) => {
  if (!path) return "";

  if (path.startsWith("http")) {
    return path;
  }

  return `${imageURL}${path}`;
};

export default getImageUrl;
