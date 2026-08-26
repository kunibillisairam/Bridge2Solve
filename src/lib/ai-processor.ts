import { prisma } from './db';

interface MatchedEntity {
  id: string;
  name: string;
  score: number;
}

export async function runSimulatedAiAnalysis(problemId: string) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      console.error(`AI Analysis: Problem with ID ${problemId} not found.`);
      return null;
    }

    const textToAnalyze = (problem.title + ' ' + problem.description).toLowerCase();

    // 1. Priority/Severity Scoring
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let priorityScore = 45;

    if (
      textToAnalyze.includes('toxic') ||
      textToAnalyze.includes('contamination') ||
      textToAnalyze.includes('health hazard') ||
      textToAnalyze.includes('poison') ||
      textToAnalyze.includes('epidemic') ||
      textToAnalyze.includes('drinking water')
    ) {
      priority = 'CRITICAL';
      priorityScore = 92 + Math.floor(Math.random() * 8); // 92 - 99
    } else if (
      textToAnalyze.includes('scarcity') ||
      textToAnalyze.includes('drought') ||
      textToAnalyze.includes('waste') ||
      textToAnalyze.includes('dump') ||
      textToAnalyze.includes('flood') ||
      textToAnalyze.includes('sewage')
    ) {
      priority = 'HIGH';
      priorityScore = 75 + Math.floor(Math.random() * 15); // 75 - 89
    } else if (
      textToAnalyze.includes('literacy') ||
      textToAnalyze.includes('training') ||
      textToAnalyze.includes('school') ||
      textToAnalyze.includes('education') ||
      textToAnalyze.includes('employment')
    ) {
      priority = 'MEDIUM';
      priorityScore = 55 + Math.floor(Math.random() * 18); // 55 - 72
    }

    // 2. Duplicate Detection (Simulated keyword check against other problems)
    const allProblems = await prisma.problem.findMany({
      where: {
        id: { not: problemId },
      },
    });

    const duplicates: string[] = [];
    const problemWords = problem.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    
    for (const p of allProblems) {
      let matchCount = 0;
      const otherTitle = p.title.toLowerCase();
      for (const word of problemWords) {
        if (otherTitle.includes(word)) {
          matchCount++;
        }
      }
      if (matchCount >= 3) {
        duplicates.push(p.id);
      }
    }

    // 3. Extracting required expertise
    let requiredExpertise: string[] = [];
    if (problem.category.includes('Agriculture') || problem.category.includes('Water')) {
      requiredExpertise = ['Hydrology', 'IoT Sensors', 'Irrigation Systems', 'Civil Engineering'];
    } else if (problem.category.includes('Waste') || problem.category.includes('Environmental')) {
      requiredExpertise = ['Environmental Science', 'Chemical Engineering', 'Waste Management', 'Bioremediation'];
    } else if (problem.category.includes('Education') || problem.category.includes('Skill')) {
      requiredExpertise = ['Information Technology', 'Curriculum Design', 'E-learning Systems', 'Rural Development'];
    } else {
      requiredExpertise = ['Social Entrepreneurship', 'Project Management', 'Public Policy', 'Resource Optimization'];
    }

    // 4. Smart Matching Score
    const universities = await prisma.user.findMany({ where: { role: 'UNIVERSITY' } });
    const industries = await prisma.user.findMany({ where: { role: 'INDUSTRY' } });

    const matchedInstitutions: MatchedEntity[] = [];
    const matchedIndustries: MatchedEntity[] = [];

    // Score Universities based on category alignment
    for (const u of universities) {
      let score = 50 + Math.floor(Math.random() * 20); // Baseline 50-70

      const orgDetailsLower = (u.orgDetails || '').toLowerCase();
      const orgNameLower = (u.orgName || '').toLowerCase();

      if (problem.category.includes('Water') || problem.category.includes('Agriculture')) {
        if (orgDetailsLower.includes('water') || orgDetailsLower.includes('agricultural') || orgNameLower.includes('iisc')) {
          score += 25;
        }
      }
      if (problem.category.includes('Waste') || problem.category.includes('Environmental')) {
        if (orgDetailsLower.includes('environmental') || orgDetailsLower.includes('waste') || orgNameLower.includes('anna')) {
          score += 25;
        }
      }
      if (problem.category.includes('Education') || problem.category.includes('Skill')) {
        if (orgDetailsLower.includes('digital') || orgDetailsLower.includes('education')) {
          score += 25;
        }
      }

      matchedInstitutions.push({
        id: u.id,
        name: u.name,
        score: Math.min(score, 99),
      });
    }

    // Score Industries based on CSR alignment
    for (const ind of industries) {
      let score = 50 + Math.floor(Math.random() * 20); // Baseline 50-70

      const details = (ind.orgDetails || '').toLowerCase();
      const name = (ind.name || '').toLowerCase();

      if (problem.category.includes('Water') || problem.category.includes('Agriculture') || problem.category.includes('Waste')) {
        if (details.includes('sustainability') || details.includes('environmental') || name.includes('tata')) {
          score += 25;
        }
      }
      if (problem.category.includes('Education') || problem.category.includes('Skill')) {
        if (details.includes('education') || details.includes('literacy') || name.includes('infosys')) {
          score += 25;
        }
      }

      matchedIndustries.push({
        id: ind.id,
        name: ind.name,
        score: Math.min(score, 99),
      });
    }

    // Sort by match score descending
    matchedInstitutions.sort((a, b) => b.score - a.score);
    matchedIndustries.sort((a, b) => b.score - a.score);

    const overallMatchingScore = matchedInstitutions.length > 0 ? matchedInstitutions[0].score : 70;

    // Delete existing analysis if it exists
    await prisma.aiAnalysis.deleteMany({
      where: { problemId },
    });

    // Save AI analysis record
    const analysis = await prisma.aiAnalysis.create({
      data: {
        problemId,
        category: problem.category,
        priority,
        priorityScore,
        duplicateIds: JSON.stringify(duplicates),
        requiredExpertise: JSON.stringify(requiredExpertise),
        matchingScore: overallMatchingScore,
        matchedInstitutions: JSON.stringify(matchedInstitutions),
        matchedIndustries: JSON.stringify(matchedIndustries),
        reviewStatus: 'PENDING',
      },
    });

    return analysis;
  } catch (error) {
    console.error('Error running simulated AI analysis:', error);
    return null;
  }
}
