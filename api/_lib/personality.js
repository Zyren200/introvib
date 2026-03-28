const INTEREST_BUCKETS = {
  Introvert: ["Listening to music", "Reading", "Spending time alone"],
  Ambivert: ["Hiking", "Gaming", "Volunteering"],
  Extrovert: ["Attending parties", "Concerts", "Public events"],
};

const normalizeText = (value) =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase();

const uniqueInterests = (interests = []) =>
  Array.from(
    new Set(
      (Array.isArray(interests) ? interests : [])
        .map((interest) => (interest || "").toString().trim())
        .filter(Boolean)
    )
  );

const getInterestAffinity = (interest) => {
  const normalizedInterest = normalizeText(interest);

  for (const [personalityType, bucketInterests] of Object.entries(INTEREST_BUCKETS)) {
    if (bucketInterests.some((entry) => normalizeText(entry) === normalizedInterest)) {
      return personalityType;
    }
  }

  return "Mixed";
};

const predictPersonalityFromInterests = (interests = []) => {
  const counts = {
    Introvert: 0,
    Ambivert: 0,
    Extrovert: 0,
  };

  uniqueInterests(interests).forEach((interest) => {
    const affinity = getInterestAffinity(interest);
    if (affinity !== "Mixed") {
      counts[affinity] += 1;
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [top, second] = sorted;

  if (!top || top[1] === 0) return "Ambivert";
  if (second && top[1] === second[1]) return "Ambivert";
  return top[0];
};

const resolvePersonalityFromAnswers = (answers = [], fallbackPersonality = "Ambivert") => {
  const counts = {
    Introvert: 0,
    Ambivert: 0,
    Extrovert: 0,
  };

  answers.forEach((answer) => {
    if (answer === "A") counts.Introvert += 1;
    if (answer === "B") counts.Ambivert += 1;
    if (answer === "C") counts.Extrovert += 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [top, second] = sorted;

  if (!top || top[1] === 0) return fallbackPersonality || "Ambivert";
  if (second && top[1] === second[1]) return fallbackPersonality || "Ambivert";
  return top[0];
};

const mapAnswerToPersonality = (answerCode) => {
  if (answerCode === "A") return "Introvert";
  if (answerCode === "B") return "Ambivert";
  if (answerCode === "C") return "Extrovert";
  return null;
};

module.exports = {
  INTEREST_BUCKETS,
  getInterestAffinity,
  mapAnswerToPersonality,
  normalizeText,
  predictPersonalityFromInterests,
  resolvePersonalityFromAnswers,
  uniqueInterests,
};
