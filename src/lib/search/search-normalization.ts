import {
  CANONICAL_DISCIPLINES,
  CANONICAL_SERVICES,
  CANONICAL_STAGES,
  CANONICAL_WORK_TYPES,
  getTaxonomyDiscipline,
  getTaxonomyService,
  getTaxonomyStage,
  getTaxonomyWorkType,
  type CanonicalDisciplineSlug,
  type CanonicalServiceSlug,
  type CanonicalStageSlug,
  type CanonicalWorkTypeSlug,
} from "@/lib/taxonomy";
import {
  DOMINICAN_CONSTRUCTION_SYNONYMS,
  type DominicanConstructionSynonym,
} from "@/lib/search/dominican-construction-synonyms";

const stripAccents = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const normalizeSearchText = (value: string): string =>
  stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const singularizeToken = (token: string): string => {
  if (token.length <= 3) return token;

  if (token.endsWith("es") && token.length > 4) {
    return token.slice(0, -2);
  }

  if (token.endsWith("s") && token.length > 3) {
    return token.slice(0, -1);
  }

  return token;
};

const getTokenVariants = (token: string): string[] => {
  const singular = singularizeToken(token);
  if (singular === token) return [token];
  return [token, singular];
};

const canonicalVocabulary = new Set(
  [
    ...CANONICAL_STAGES.flatMap((item) => [item.slug, item.label]),
    ...CANONICAL_DISCIPLINES.flatMap((item) => [item.slug, item.label]),
    ...CANONICAL_SERVICES.flatMap((item) => [item.slug, item.label]),
    ...CANONICAL_WORK_TYPES.flatMap((item) => [item.slug, item.label]),
  ].map(normalizeSearchText),
);

const normalizeSlugForSearch = (slug: string) => normalizeSearchText(slug.replace(/_/g, " "));

const normalizedSynonymPatterns = DOMINICAN_CONSTRUCTION_SYNONYMS.map((entry) => ({
  ...entry,
  normalizedPatterns: entry.patterns.map((pattern) => normalizeSearchText(pattern)),
}));

const patternMatchesQuery = (normalizedQuery: string, queryTokenSet: Set<string>, normalizedPattern: string) => {
  if (!normalizedPattern) return false;
  if (normalizedQuery.includes(normalizedPattern)) return true;

  const patternTokens = normalizedPattern.split(" ").filter(Boolean);
  if (patternTokens.length === 0) return false;

  return patternTokens.every((token) => queryTokenSet.has(token));
};

const buildCanonicalTermExpansion = (entry: DominicanConstructionSynonym): string[] => {
  const terms: string[] = [];

  for (const stageSlug of entry.canonical.stageSlugs ?? []) {
    const stage = getTaxonomyStage(stageSlug as CanonicalStageSlug);
    terms.push(normalizeSlugForSearch(stageSlug));
    if (stage?.label) terms.push(normalizeSearchText(stage.label));
  }

  for (const disciplineSlug of entry.canonical.disciplineSlugs ?? []) {
    const discipline = getTaxonomyDiscipline(disciplineSlug as CanonicalDisciplineSlug);
    terms.push(normalizeSlugForSearch(disciplineSlug));
    if (discipline?.label) terms.push(normalizeSearchText(discipline.label));
  }

  for (const serviceSlug of entry.canonical.serviceSlugs ?? []) {
    const service = getTaxonomyService(serviceSlug as CanonicalServiceSlug);
    terms.push(normalizeSlugForSearch(serviceSlug));
    if (service?.label) terms.push(normalizeSearchText(service.label));
  }

  for (const workTypeSlug of entry.canonical.workTypeSlugs ?? []) {
    const workType = getTaxonomyWorkType(workTypeSlug as CanonicalWorkTypeSlug);
    terms.push(normalizeSlugForSearch(workTypeSlug));
    if (workType?.label) terms.push(normalizeSearchText(workType.label));
  }

  for (const categorySlug of entry.legacyCategorySlugs ?? []) {
    terms.push(normalizeSlugForSearch(categorySlug));
  }

  for (const rawTerm of entry.expansionTerms) {
    terms.push(normalizeSearchText(rawTerm));
  }

  return terms.filter(Boolean);
};

export interface SearchNormalizationResult {
  rawQuery: string;
  normalizedQuery: string;
  normalizedTokens: string[];
  searchTerms: string[];
  matchedSynonymIds: string[];
  canonicalHints: {
    stageSlugs: CanonicalStageSlug[];
    disciplineSlugs: CanonicalDisciplineSlug[];
    serviceSlugs: CanonicalServiceSlug[];
    workTypeSlugs: CanonicalWorkTypeSlug[];
  };
  unmatchedNormalizedQuery: boolean;
}

export const buildSearchNormalization = (rawQuery: string): SearchNormalizationResult => {
  const normalizedQuery = normalizeSearchText(rawQuery);
  const baseTokens = normalizedQuery.split(" ").filter(Boolean);
  const tokenVariants = new Set<string>();

  for (const token of baseTokens) {
    for (const variant of getTokenVariants(token)) {
      tokenVariants.add(variant);
    }
  }

  const queryTokenSet = new Set(tokenVariants);
  const matchedSynonyms = normalizedSynonymPatterns.filter((entry) =>
    entry.normalizedPatterns.some((pattern) => patternMatchesQuery(normalizedQuery, queryTokenSet, pattern)),
  );

  const searchTerms = new Set<string>();
  if (normalizedQuery) searchTerms.add(normalizedQuery);
  for (const token of tokenVariants) {
    if (token.length >= 2) searchTerms.add(token);
  }

  const stageHintSet = new Set<CanonicalStageSlug>();
  const disciplineHintSet = new Set<CanonicalDisciplineSlug>();
  const serviceHintSet = new Set<CanonicalServiceSlug>();
  const workTypeHintSet = new Set<CanonicalWorkTypeSlug>();

  for (const synonym of matchedSynonyms) {
    for (const term of buildCanonicalTermExpansion(synonym)) {
      if (term.length >= 2) searchTerms.add(term);
    }

    for (const stageSlug of synonym.canonical.stageSlugs ?? []) {
      stageHintSet.add(stageSlug);
    }
    for (const disciplineSlug of synonym.canonical.disciplineSlugs ?? []) {
      disciplineHintSet.add(disciplineSlug);
    }
    for (const serviceSlug of synonym.canonical.serviceSlugs ?? []) {
      serviceHintSet.add(serviceSlug);
    }
    for (const workTypeSlug of synonym.canonical.workTypeSlugs ?? []) {
      workTypeHintSet.add(workTypeSlug);
    }
  }

  const hasCanonicalVocabularyHit = Array.from(searchTerms).some((term) =>
    Array.from(canonicalVocabulary).some((vocabTerm) => vocabTerm.includes(term) || term.includes(vocabTerm)),
  );

  return {
    rawQuery,
    normalizedQuery,
    normalizedTokens: Array.from(tokenVariants),
    searchTerms: Array.from(searchTerms),
    matchedSynonymIds: matchedSynonyms.map((entry) => entry.id),
    canonicalHints: {
      stageSlugs: Array.from(stageHintSet),
      disciplineSlugs: Array.from(disciplineHintSet),
      serviceSlugs: Array.from(serviceHintSet),
      workTypeSlugs: Array.from(workTypeHintSet),
    },
    unmatchedNormalizedQuery:
      normalizedQuery.length > 0 && matchedSynonyms.length === 0 && !hasCanonicalVocabularyHit,
  };
};
