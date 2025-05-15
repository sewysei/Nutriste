import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_CX = process.env.GOOGLE_SEARCH_API_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;

export const getImageForFoodBase64 = async (foodName) => {
  try {
    const searchRes = await axios.get(
      `https://www.googleapis.com/customsearch/v1`,
      {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CX,
          searchType: "image",
          q: foodName,
          num: 1,
        },
      }
    );

    const imageUrl = searchRes.data.items?.[0]?.link;
    if (!imageUrl) return null;

    // Download image as array buffer
    const imgRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const contentType = imgRes.headers["content-type"];
    const base64 = Buffer.from(imgRes.data, "binary").toString("base64");

    // return as data URL
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(
      "Failed to fetch Base64 image for",
      foodName,
      error.message,
      GOOGLE_CX,
      GOOGLE_API_KEY
    );
    return null;
  }
};
