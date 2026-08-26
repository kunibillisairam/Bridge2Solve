export interface ProblemAnalysis {
  id?: string;
  problemId: string;
  category: string;
  subcategory: string;
  summary: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  affectedArea: "RURAL" | "URBAN" | "PERI_URBAN" | "TRIBAL";
  impactLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  requiredExpertise: string[];
  suggestedDomains: string[];
  analyzedAt: string;
  reviewStatus?: "PENDING" | "ACCEPTED" | "MODIFIED";
}

interface ProblemInput {
  id?: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  state?: string;
  district?: string;
  affectedPopulation?: string | number;
}

/**
 * Server-side AI Problem Analysis Service.
 * Provides deterministic structured problem analysis with fallback support.
 */
export async function analyzeProblem(input: ProblemInput): Promise<ProblemAnalysis> {
  const text = `${input.title} ${input.description} ${input.category || ""} ${input.location || ""}`.toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  try {
    // Check if an external LLM API key is present in server environment variables
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey && process.env.ENABLE_EXTERNAL_AI === "true") {
      const apiResult = await callExternalAIService(input, apiKey);
      if (apiResult) return apiResult;
    }
  } catch (error) {
    console.warn("External AI call failed or timed out. Falling back to deterministic analysis engine:", error);
  }

  // ----------------------------------------------------
  // Deterministic Analysis Engine (Development / Default)
  // ----------------------------------------------------

  // 1. Water & Sanitation Domain
  if (
    text.includes("water") || 
    text.includes("borewell") || 
    text.includes("drinking") || 
    text.includes("well") || 
    text.includes("filtration") || 
    text.includes("sewage") || 
    text.includes("sanitation")
  ) {
    return {
      problemId: input.id || `prob-${Date.now()}`,
      category: "Water & Sanitation",
      subcategory: text.includes("filtration") || text.includes("sewage") ? "Water Quality & Treatment" : "Water Availability",
      summary: "Seasonal or structural drinking water shortage affecting rural community health and daily access.",
      severity: "HIGH",
      affectedArea: text.includes("tribal") ? "TRIBAL" : text.includes("urban") ? "URBAN" : "RURAL",
      impactLevel: "HIGH",
      requiredExpertise: ["Water Resources", "Civil Engineering", "Environmental Engineering", "Hydrogeology"],
      suggestedDomains: ["Slow Sand Filtration", "Rainwater Harvesting", "Groundwater Mapping", "Community Water Systems"],
      analyzedAt: today,
      reviewStatus: "PENDING",
    };
  }

  // 2. Agriculture & Food Tech Domain
  if (
    text.includes("crop") || 
    text.includes("soil") || 
    text.includes("salinity") || 
    text.includes("saline") || 
    text.includes("farmer") || 
    text.includes("fertilizer") || 
    text.includes("harvest") ||
    text.includes("pesticide")
  ) {
    return {
      problemId: input.id || `prob-${Date.now()}`,
      category: "Agriculture & Food Tech",
      subcategory: text.includes("salinity") || text.includes("soil") ? "Soil Bioremediation" : "Crop Yield Optimization",
      summary: "Agricultural soil degradation and yield reduction impacting farmer livelihoods and local food security.",
      severity: "HIGH",
      affectedArea: "RURAL",
      impactLevel: "HIGH",
      requiredExpertise: ["Agricultural Science", "Biotechnology", "Microbiology", "Soil Chemistry"],
      suggestedDomains: ["Halophilic Bio-fertilizers", "Salt-Tolerant Crops", "Sustainable Drainage", "Soil Testing"],
      analyzedAt: today,
      reviewStatus: "PENDING",
    };
  }

  // 3. Education & Social Impact Domain
  if (
    text.includes("school") || 
    text.includes("classroom") || 
    text.includes("student") || 
    text.includes("teacher") || 
    text.includes("dropout") || 
    text.includes("learning") ||
    text.includes("education")
  ) {
    return {
      problemId: input.id || `prob-${Date.now()}`,
      category: "Education & Social Impact",
      subcategory: text.includes("dropout") ? "Educational Equity & Access" : "School Infrastructure",
      summary: "Infrastructure deficits or socio-demographic factors impacting basic education and retention rates.",
      severity: "MEDIUM",
      affectedArea: text.includes("tribal") ? "TRIBAL" : "RURAL",
      impactLevel: "MEDIUM",
      requiredExpertise: ["Pedagogy", "Social Work", "Educational Technology", "Child Psychology"],
      suggestedDomains: ["Vernacular E-Learning Kits", "Community Learning Hubs", "Offline Educational Tablets"],
      analyzedAt: today,
      reviewStatus: "PENDING",
    };
  }

  // 4. Renewable Energy Domain
  if (
    text.includes("electricity") || 
    text.includes("power") || 
    text.includes("solar") || 
    text.includes("outage") || 
    text.includes("grid") || 
    text.includes("energy")
  ) {
    return {
      problemId: input.id || `prob-${Date.now()}`,
      category: "Renewable Energy",
      subcategory: "Solar Photovoltaic & Microgrids",
      summary: "Frequent power cuts interrupting essential public infrastructure and educational smart facilities.",
      severity: "HIGH",
      affectedArea: "RURAL",
      impactLevel: "HIGH",
      requiredExpertise: ["Electrical Engineering", "Solar Photovoltaics", "Battery Energy Storage Systems"],
      suggestedDomains: ["Rooftop Solar PV", "LiFePO4 Microgrids", "Charge Controller Optimization"],
      analyzedAt: today,
      reviewStatus: "PENDING",
    };
  }

  // 5. Waste Management Domain
  if (
    text.includes("waste") || 
    text.includes("garbage") || 
    text.includes("trash") || 
    text.includes("recycling") || 
    text.includes("landfill") || 
    text.includes("sorting")
  ) {
    return {
      problemId: input.id || `prob-${Date.now()}`,
      category: "Waste Management",
      subcategory: "Automated Waste Sorting",
      summary: "Mixed un-segregated municipal waste overburdening local landfills and public hygiene.",
      severity: "MEDIUM",
      affectedArea: "URBAN",
      impactLevel: "MEDIUM",
      requiredExpertise: ["Mechanical Engineering", "Computer Vision", "Environmental Management"],
      suggestedDomains: ["Computer Vision Waste Sorting", "Recycling Conveyors", "Urban Logistics"],
      analyzedAt: today,
      reviewStatus: "PENDING",
    };
  }

  // Generic Default Fallback
  return {
    problemId: input.id || `prob-${Date.now()}`,
    category: input.category || "Community Development",
    subcategory: "General Community Needs",
    summary: input.description.slice(0, 120) + (input.description.length > 120 ? "..." : ""),
    severity: "MEDIUM",
    affectedArea: "RURAL",
    impactLevel: "MEDIUM",
    requiredExpertise: ["Field Research", "Project Management", "Community Outreach"],
    suggestedDomains: ["Local Infrastructure", "Capacity Building", "Public Resource Allocation"],
    analyzedAt: today,
    reviewStatus: "PENDING",
  };
}

/**
 * Optional server-side call helper for external LLMs (Gemini / OpenAI).
 */
async function callExternalAIService(input: ProblemInput, apiKey: string): Promise<ProblemAnalysis | null> {
  // Placeholder for external provider fetch with timeout
  return null;
}
