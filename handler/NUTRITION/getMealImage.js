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
    // Translate foodName to English using LibreTranslate API
    let formattedFoodName = foodName;
    try {
      const translateRes = await axios.post(
        "https://libretranslate.de/translate",
        {
          q: foodName,
          source: "auto",
          target: "en",
          format: "text",
        },
        {
          headers: { accept: "application/json" },
        }
      );
      if (translateRes.data && translateRes.data.translatedText) {
        formattedFoodName = translateRes.data.translatedText;
      }
    } catch (translateErr) {
      console.warn("Translation failed, using original food name.");
    }
    const foodNames = formattedFoodName.trim().toLowerCase();
    // Step 1: Cari gambar dari Unsplash
    const searchRes = await axios.get(
      "https://api.unsplash.com/search/photos",
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        params: {
          query: foodNames,
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
