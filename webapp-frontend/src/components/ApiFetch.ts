// Simulated delay to mimic network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const API_URL = "http://13.250.60.84:8000"
const API_AWB_VALIDATE_URL = `${API_URL}/awb/` // post
const API_AWB_TEXT_EXTRACT = `${API_URL}/awb/` // get
const API_AWB_SEM_SEARCH = `${API_URL}/search/` // post

// Types
type BarcodeSearchResult = {
  exists: boolean;
  possibleMatches: string[];
  confidence: number[];
};

type DescriptionSearchResult = {
  matches: Array<{ id: string; description: string; dimensions: string; }>;
};

// API functions
export async function scanBarcode(image: File): Promise<BarcodeSearchResult> {
  await delay(1500); // Simulate network delay

  // Simulate image processing and barcode detection
  return {
    exists: false,
    possibleMatches: ["ABC123456", "ABC123457", "ABC123458"],
    confidence: [95, 85, 75]
  };
}

export async function searchByCode(code: string): Promise<BarcodeSearchResult> {
  await delay(1000); // Simulate network delay

  // Simulate database search
  return {
    exists: true,
    possibleMatches: [code],
    confidence: [100]
  };
}

export async function searchByDescription(description: string, dimensions?: { length: string; width: string; height: string }): Promise<DescriptionSearchResult> {
  await delay(1000); // Simulate network delay

  // Simulate semantic search
  return {
    matches: [
      { id: "421-98765432", description: "A shipment of 50 LCD monitors, model HM278, packed in individual boxes with protective foam." },
      { id: "753-12345678", description: "20 units of high-definition LED screens, model SL-4K,  for a digital signage project." },
      { id: "298-87654321", description: "" }
    ]
  };
}

export async function processImage(image: File): Promise<{ detectedCode: string; searchResult: BarcodeSearchResult }> {
  await delay(2000); // Simulate image processing delay

  // Simulate image processing and code detection
  const detectedCode = "DEF987654";
  const searchResult: BarcodeSearchResult = {
    exists: false,
    possibleMatches: ["DEF987654", "DEF987655", "DEF987656"],
    confidence: [90, 80, 70]
  };

  return { detectedCode, searchResult };
}

export async function retryImageProcess(image: File): Promise<{ detectedCode: string; searchResult: BarcodeSearchResult }> {
  await delay(1500); // Simulate reprocessing delay

  // Simulate improved image processing results
  const detectedCode = "GHI654321";
  const searchResult: BarcodeSearchResult = {
    exists: false,
    possibleMatches: ["GHI654321", "GHI654322", "GHI654323"],
    confidence: [88, 78, 68]
  };

  return { detectedCode, searchResult };
}