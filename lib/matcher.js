/**
 * Intelligent Relevance & Match Scoring Engine
 * Evaluates listings against user preferences (Role, Location, Seniority, Skills)
 * and assigns a 0-100% weighted match score with transparent breakdown.
 */

const ROLE_SYNONYMS = {
  ui_ux: ['ui/ux', 'ui-ux', 'ui ux', 'ux', 'ui', 'product designer', 'product design', 'visual designer', 'interaction designer', 'user experience', 'user interface', 'figma', 'design system', 'design intern', 'web designer'],
  frontend: ['frontend', 'front-end', 'ui', 'ux', 'web', 'react', 'client'],
  backend: ['backend', 'back-end', 'server', 'distributed', 'api', 'microservices', 'systems'],
  fullstack: ['fullstack', 'full-stack', 'full stack', 'web developer'],
  ai: ['ai', 'artificial intelligence', 'ml', 'machine learning', 'deep learning', 'nlp', 'llm', 'computer vision'],
  data: ['data', 'analytics', 'bi', 'business intelligence', 'data science', 'data engineer', 'analyst'],
  devops: ['devops', 'sre', 'site reliability', 'infrastructure', 'platform', 'cloud', 'kubernetes'],
  mobile: ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
  security: ['security', 'infosec', 'cybersecurity', 'appsec']
};

function scoreRole(jobTitle, requestedRole, requestedSeniority) {
  if (!requestedRole || requestedRole.trim() === '') return 30; // Neutral baseline

  const titleLower = (jobTitle || '').toLowerCase();
  const reqLower = requestedRole.toLowerCase().trim();

  // 1. Direct substring match
  if (titleLower.includes(reqLower)) {
    return 35;
  }

  // 2. Token overlap
  const reqTokens = reqLower.split(/\s+/).filter(t => t.length > 2);
  let tokenMatches = 0;
  for (const token of reqTokens) {
    if (titleLower.includes(token)) {
      tokenMatches++;
    }
  }

  if (reqTokens.length > 0 && tokenMatches === reqTokens.length) {
    return 35;
  } else if (tokenMatches > 0) {
    return Math.round((tokenMatches / reqTokens.length) * 30);
  }

  // 3. Synonym matching
  for (const [key, synonyms] of Object.entries(ROLE_SYNONYMS)) {
    const userWantsKey = synonyms.some(s => reqLower.includes(s));
    if (userWantsKey) {
      const jobMatchesKey = synonyms.some(s => titleLower.includes(s));
      if (jobMatchesKey) {
        return 28;
      }
    }
  }

  // General tech match
  if (titleLower.includes('software') || titleLower.includes('engineer') || titleLower.includes('developer')) {
    return 15;
  }

  return 5;
}

function scoreSkills(job, requestedKeywords) {
  if (!requestedKeywords || requestedKeywords.length === 0) {
    return { score: 25, matched: [], missing: [] }; // Neutral baseline
  }

  const searchableText = [
    job.title,
    job.description,
    (job.skills || []).join(' '),
    (job.requirements || []).join(' ')
  ].join(' ').toLowerCase();

  const matched = [];
  const missing = [];

  for (const kw of requestedKeywords) {
    const cleanKw = kw.trim();
    if (!cleanKw) continue;
    const kwLower = cleanKw.toLowerCase();

    // Word boundary or symbol matching for C++, C#, Go, etc.
    const isMatched = searchableText.includes(kwLower);
    if (isMatched) {
      matched.push(cleanKw);
    } else {
      missing.push(cleanKw);
    }
  }

  const total = matched.length + missing.length;
  if (total === 0) return { score: 25, matched: [], missing: [] };

  const ratio = matched.length / total;
  const score = Math.round(ratio * 35);

  return { score, matched, missing };
}

function scoreLocation(job, requestedLocation, workModePref) {
  const jobLoc = (job.location || '').toLowerCase();
  const jobMode = (job.workMode || '').toLowerCase();

  // If user specifically requested Remote
  if (workModePref === 'remote' || (requestedLocation && requestedLocation.toLowerCase().includes('remote'))) {
    if (jobMode === 'remote' || jobLoc.includes('remote')) {
      return 20;
    }
    return 5;
  }

  if (!requestedLocation || requestedLocation.trim() === '') {
    return 15; // Neutral
  }

  const reqLocLower = requestedLocation.toLowerCase().trim();

  // Direct match
  if (jobLoc.includes(reqLocLower)) {
    return 20;
  }

  // Delhi NCR regional alignment
  const isDelhiUser = reqLocLower.includes('delhi') || reqLocLower.includes('noida') || reqLocLower.includes('gurgaon') || reqLocLower.includes('ncr');
  const isDelhiJob = jobLoc.includes('delhi') || jobLoc.includes('noida') || jobLoc.includes('gurgaon') || jobLoc.includes('ncr');
  if (isDelhiUser && isDelhiJob) {
    return 20;
  }

  // Remote friendly matches anyone
  if (jobMode === 'remote' || jobLoc.includes('remote')) {
    return 18;
  }

  // Country fallback: e.g. "India" in both
  if ((reqLocLower.includes('india') && jobLoc.includes('india')) ||
      (reqLocLower.includes('us') && (jobLoc.includes('us') || jobLoc.includes('united states')))) {
    return 14;
  }

  return 5;
}

function scoreSeniority(jobSeniority, requestedSeniority) {
  if (!requestedSeniority || requestedSeniority === 'all') return 10;
  const jobSen = (jobSeniority || '').toLowerCase();
  const reqSen = requestedSeniority.toLowerCase();

  if (jobSen.includes(reqSen) || reqSen.includes(jobSen)) {
    return 10;
  }
  // Intern vs Entry Level close alignment
  if ((jobSen.includes('intern') && reqSen.includes('entry')) ||
      (jobSen.includes('entry') && reqSen.includes('intern'))) {
    return 7;
  }
  return 3;
}

function matchAndRankListings(listings, preferences = {}) {
  const {
    role = '',
    location = '',
    keywords = [],
    seniority = 'all',
    workMode = 'all',
    minScore = 0
  } = preferences;

  const keywordList = Array.isArray(keywords)
    ? keywords
    : (typeof keywords === 'string' ? keywords.split(',').map(s => s.trim()).filter(Boolean) : []);

  const scoredList = listings.map(job => {
    const roleScore = scoreRole(job.title, role, seniority);
    const { score: skillScore, matched: matchedSkills, missing: missingSkills } = scoreSkills(job, keywordList);
    const locScore = scoreLocation(job, location, workMode);
    const senScore = scoreSeniority(job.seniority, seniority);

    const totalScore = Math.min(100, Math.max(0, roleScore + skillScore + locScore + senScore));

    const matchReasons = [];
    if (role && roleScore >= 25) {
      matchReasons.push(`Strong alignment with target role "${role}"`);
    }
    if (matchedSkills.length > 0) {
      matchReasons.push(`Contains ${matchedSkills.length} requested skills: ${matchedSkills.slice(0, 4).join(', ')}`);
    }
    if (locScore >= 18) {
      matchReasons.push(`Matches location/work-mode preference (${job.workMode || job.location})`);
    }
    if (senScore === 10) {
      matchReasons.push(`Matches exact seniority level: ${job.seniority}`);
    }

    return {
      ...job,
      matchScore: totalScore,
      scoreBreakdown: {
        role: roleScore,
        skills: skillScore,
        location: locScore,
        seniority: senScore
      },
      matchedSkills,
      missingSkills,
      matchReasons
    };
  });

  // Filter by minScore and workMode if specified
  const filtered = scoredList.filter(job => {
    if (job.matchScore < minScore) return false;
    if (workMode === 'remote' && job.workMode?.toLowerCase() !== 'remote' && !job.location?.toLowerCase().includes('remote')) {
      return false;
    }
    return true;
  });

  // Rank by matchScore descending
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  return filtered;
}

module.exports = {
  scoreRole,
  scoreSkills,
  scoreLocation,
  scoreSeniority,
  matchAndRankListings
};
