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
  engineUsed?: "Gemini" | "Fallback Rule-Based Engine";
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
 * Leverages Gemini API when key is configured, with deterministic fallback engine.
 */
export async function analyzeProblem(input: ProblemInput): Promise<ProblemAnalysis> {
  const text = `${input.title} ${input.description} ${input.category || ""} ${input.location || ""}`.toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      const apiResult = await callExternalAIService(input, apiKey);
      if (apiResult) {
        return {
          ...apiResult,
          engineUsed: "Gemini",
        };
      }
    }
  } catch (error) {
    console.warn("Gemini AI call failed or timed out. Falling back to deterministic analysis engine:", error);
  }

  const fallbackResult = getFallbackAnalysis(input, text, today);
  return {
    ...fallbackResult,
    engineUsed: "Fallback Rule-Based Engine",
  };
}

function getFallbackAnalysis(input: ProblemInput, text: string, today: string): ProblemAnalysis {

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
 * Server-side live call to Gemini API for structured problem intelligence.
 */
async function callExternalAIService(input: ProblemInput, apiKey: string): Promise<ProblemAnalysis | null> {
  const prompt = `Analyze the following community problem and return ONLY a valid JSON object matching this schema:
{
  "category": "string (e.g. Water & Sanitation, Agriculture & Food Tech, Education & Social Impact, Renewable Energy, Waste Management)",
  "subcategory": "string",
  "summary": "string (1-2 concise sentences)",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "affectedArea": "RURAL" | "URBAN" | "PERI_URBAN" | "TRIBAL",
  "impactLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "requiredExpertise": ["string", "string"],
  "suggestedDomains": ["string", "string"]
}

Problem Title: ${input.title}
Problem Description: ${input.description}
Location: ${input.location || ""}
Category: ${input.category || ""}
Affected Population: ${input.affectedPopulation || ""}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) return null;

    const parsed = JSON.parse(responseText);
    const today = new Date().toISOString().split("T")[0];

    return {
      problemId: input.id || `prob-${Date.now()}`,
      category: parsed.category || input.category || "Community Development",
      subcategory: parsed.subcategory || "Community Infrastructure",
      summary: parsed.summary || input.description.slice(0, 120),
      severity: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(parsed.severity) ? parsed.severity : "HIGH",
      affectedArea: ["RURAL", "URBAN", "PERI_URBAN", "TRIBAL"].includes(parsed.affectedArea) ? parsed.affectedArea : "RURAL",
      impactLevel: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(parsed.impactLevel) ? parsed.impactLevel : "HIGH",
      requiredExpertise: Array.isArray(parsed.requiredExpertise) ? parsed.requiredExpertise : ["Field Research"],
      suggestedDomains: Array.isArray(parsed.suggestedDomains) ? parsed.suggestedDomains : ["Local Infrastructure"],
      analyzedAt: today,
      reviewStatus: "PENDING",
    };
  } catch (error) {
    console.warn("Gemini API call failed, using fallback engine:", error);
    return null;
  }
}
