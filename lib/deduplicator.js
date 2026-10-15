/**
 * Deduplication Engine
 * Normalizes company names, job titles, and application URLs,
 * merging cross-posted listings into single canonical job records.
 */

function normalizeCompany(company) {
  if (!company) return 'Unknown';
  let cleaned = company.trim();
  cleaned = cleaned.replace(/\b(Inc\.?|LLC|Pvt\.? Ltd\.?|Ltd\.?|Corporation|Corp\.?|Technologies|Software)\b/gi, '');
  cleaned = cleaned.replace(/[,.-]+$/g, '').trim();
  return cleaned || company;
}

function normalizeTitle(title) {
  if (!title) return '';
  let cleaned = title.toLowerCase();
  // Strip common ATS noise brackets
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, ' ');
  cleaned = cleaned.replace(/\s*\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\b(hiring|urgent|immediate joiner|open to batch 202[0-9]|batch 202[0-9]|summer 202[0-9]|fall 202[0-9]|winter 202[0-9])\b/gi, '');
  cleaned = cleaned.replace(/[-–—|:]+/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

function canonicalizeUrl(urlStr) {
  if (!urlStr) return '';
  try {
    const parsed = new URL(urlStr);
    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'gh_jid', 'lever-source', 'ref', 'source', 'tracking_id', 'fbclid', 'gclid',
      'job_id', 'hash'
    ];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    parsed.hash = '';
    let clean = parsed.toString();
    if (clean.endsWith('/') && parsed.pathname.length > 1) {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch (e) {
    return urlStr.split('?')[0].replace(/#.*$/, '');
  }
}

function deduplicateListings(listings) {
  if (!Array.isArray(listings)) return { deduplicated: [], stats: { original: 0, deduplicated: 0, merged: 0 } };

  const seenMap = new Map();
  const mergedList = [];
  let mergedCount = 0;

  for (const item of listings) {
    const normCompany = normalizeCompany(item.company).toLowerCase();
    const normTitle = normalizeTitle(item.title);
    const cleanUrl = canonicalizeUrl(item.applyUrl);

    // Primary key: company + simplified title
    const primaryKey = `${normCompany}::${normTitle}`;
    // Secondary key: canonical URL domain + path
    const urlKey = cleanUrl;

    let existing = seenMap.get(primaryKey);
    if (!existing && cleanUrl) {
      existing = seenMap.get(urlKey);
    }

    if (existing) {
      mergedCount++;
      // Merge properties: enrich skills, retain longer description
      const combinedSkills = Array.from(new Set([...(existing.skills || []), ...(item.skills || [])]));
      existing.skills = combinedSkills;

      if ((item.description || '').length > (existing.description || '').length) {
        existing.description = item.description;
      }
      if (!existing.salaryStipend && item.salaryStipend) {
        existing.salaryStipend = item.salaryStipend;
      }

      // Record cross-portal sources
      if (!existing.crossSources) {
        existing.crossSources = [existing.portalSource];
      }
      if (item.portalSource && !existing.crossSources.includes(item.portalSource)) {
        existing.crossSources.push(item.portalSource);
      }
    } else {
      const canonicalRecord = {
        ...item,
        company: normalizeCompany(item.company),
        applyUrl: canonicalizeUrl(item.applyUrl) || item.applyUrl,
        crossSources: [item.portalSource || 'Web']
      };
      seenMap.set(primaryKey, canonicalRecord);
      if (cleanUrl) seenMap.set(urlKey, canonicalRecord);
      mergedList.push(canonicalRecord);
    }
  }

  return {
    deduplicated: mergedList,
    stats: {
      original: listings.length,
      deduplicated: mergedList.length,
      merged: mergedCount
    }
  };
}

module.exports = {
  normalizeCompany,
  normalizeTitle,
  canonicalizeUrl,
  deduplicateListings
};
