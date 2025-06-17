import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_CX = process.env.GOOGLE_SEARCH_API_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;

export const getImageForFoodBase64 = async (foodName) => {
  try {
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      console.error("Missing Google API Key or Search Engine CX ID");
      return null;
    }

    const firstItem = foodName.split("-")[0].trim();

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

    if (!searchRes.data.items || searchRes.data.items.length === 0) {
      console.warn(`No image found for: ${foodName}`);
      return null;
    }

    const imageUrl = searchRes.data.items[0].link;

    const imgRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.google.com",
      },
    });

    const contentType = imgRes.headers["content-type"];
    const base64 = Buffer.from(imgRes.data, "binary").toString("base64");

    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.error(
      `Error while fetching image for "${foodName}": ${err.message}`
    );
    throw err;
  }
};
