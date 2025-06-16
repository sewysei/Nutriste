import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export const getImageForFoodBase64 = async (foodName) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error("Missing Unsplash Access Key");
      return null;
    }

    // Step 1: Cari gambar dari Unsplash
    const searchRes = await axios.get(
      "https://api.unsplash.com/search/photos",
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        params: {
          query: foodName,
          per_page: 1,
        },
      }
    );

    const imageUrl = searchRes.data.results[0]?.urls?.regular;
    if (!imageUrl) {
      console.warn(`No Unsplash image found for: ${foodName}`);
      return null;
    }

    // Step 2: Ambil dan ubah jadi base64
    const imgRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const contentType = imgRes.headers["content-type"];
    const base64 = Buffer.from(imgRes.data, "binary").toString("base64");

    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.error(
      `Error fetching Unsplash image for "${foodName}": ${err.message}`
    );
    return null;
  }
};
