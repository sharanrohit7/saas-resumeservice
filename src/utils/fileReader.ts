import fetch from "node-fetch";
import pdf from "pdf-parse";
export async function fetchAndExtractPdfText(url: string): Promise<string> {
    if (!url.toLowerCase().endsWith(".pdf")) {
      throw new Error("URL does not appear to be a PDF.");
    }
  
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF. Status: ${response.status}`);
    }
  
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("pdf")) {
      throw new Error(`Invalid content-type: ${contentType}`);
    }
  
    const pdfBuffer = await response.buffer();
  
    const data = await pdf(pdfBuffer);
    return data.text; // 📄 All text extracted from the PDF
  }