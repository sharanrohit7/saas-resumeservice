require('dotenv').config()
import { createClient } from "redis";
import app from "./app"
import { fetchAndExtractPdfText } from "./utils/fileReader";
// import { db } from "./config/db";

const port = process.env.PORT || 8080;
// (async () => {
//   const url = "https://lineupsapk.blob.core.windows.net/apk/8c5e466c-4b3c-42e0-8da3-399be0e3664c-ResumeM5-1745489606857-yi7vkr.pdf";

//   const text = await fetchAndExtractPdfText(url);
//   console.log("📝 Extracted Text:\n", text);
// })();

// const client = createClient({
//   // Your Redis connection details (host, port, etc.)
// });
// db()
//     .then(() => console.log('Connection established'))
//     .catch(err => console.error('Connection failed', err));
// (async () => {
//   try {
//     await client.connect();

//     try {
//       await client.setEx("redis:", 10,"connected");
//       // ... other Redis operations

//       const value = await client.get("redis:");
//       console.log("Redis data:", value);
//     } catch (error) {
//       console.error("Error using Redis:", error);
//     }
//   } catch (error) {
//     console.error("Error connecting to Redis:", error);
//     // Implement reconnection logic (optional)
//   } finally {
//     await client.quit();
//   }
// })()

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});