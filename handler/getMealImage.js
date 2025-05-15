// import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();

// const GOOGLE_CX = process.env.GOOGLE_SEARCH_API_ID;
// const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;

// export const getImageForFoodBase64 = async (foodName) => {
//   try {
//     const searchRes = await axios.get(
//       `https://www.googleapis.com/customsearch/v1`,
//       {
//         params: {
//           key: GOOGLE_API_KEY,
//           cx: GOOGLE_CX,
//           searchType: "image",
//           q: foodName,
//           num: 1,
//         },
//       }
//     );

//     const imageUrl = searchRes.data.items?.[0]?.link;
//     if (!imageUrl) return null;

//     // Download image as array buffer
//     const imgRes = await axios.get(imageUrl, {
//       responseType: "arraybuffer",
//     });

//     const contentType = imgRes.headers["content-type"];
//     const base64 = Buffer.from(imgRes.data, "binary").toString("base64");

//     // return as data URL
//     return `data:${contentType};base64,${base64}`;
//   } catch (error) {
//     console.error("Failed to fetch Base64 image for", foodName, error.message);
//     console.error("Failed to fetch Base64 image for", foodName);
//     if (error.response) {
//       console.error("Status:", error.response.status);
//       console.error("Headers:", error.response.headers);
//       console.error("Data:", error.response.data);
//     } else {
//       console.error("Error Message:", error.message);
//     }
//     return null;
//   }
// };

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_CX = process.env.GOOGLE_SEARCH_API_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;

export const getImageForFoodBase64 = async (foodName) => {
  try {
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      console.error("Missing GOOGLE_API_KEY or GOOGLE_SEARCH_API_ID");
      return null;
    }

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
      },
    });

    const contentType = imgRes.headers["content-type"];
    const base64 = Buffer.from(imgRes.data, "binary").toString("base64");

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to fetch Base64 image for", foodName);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error Message:", error.message);
    }
    return null;
  }
};
