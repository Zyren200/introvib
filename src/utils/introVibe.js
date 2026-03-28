export const INTEREST_BUCKETS = {
  Introvert: ["Listening to music", "Reading", "Spending time alone"],
  Ambivert: ["Hiking", "Gaming", "Volunteering"],
  Extrovert: ["Attending parties", "Concerts", "Public events"],
};

export const INTEREST_OPTIONS = Object.values(INTEREST_BUCKETS).flat();

export const PERSONALITY_META = {
  Introvert: {
    label: "Introvert",
    description: "You recharge in calm spaces and prefer thoughtful, deeper conversations.",
    chatLabel: "1-on-1 chat only",
    healthyTips: [
      "Protect quiet recharge time so social energy does not drain too quickly.",
      "Prioritize deep one-on-one connections over large, noisy group settings.",
      "Use journaling, music, or mindful solo routines to process emotions.",
      "Choose low-pressure activities that help you reset before reconnecting.",
    ],
    needsSudoku: true,
  },
  Ambivert: {
    label: "Ambivert",
    description: "You thrive when you can balance meaningful solo time and social time.",
    chatLabel: "1-on-1 chat and group chat",
    healthyTips: [
      "Balance social plans with protected alone time to avoid overload.",
      "Set clear boundaries so your energy stays steady across the week.",
      "Check in with yourself before saying yes to every invitation.",
      "Mix solo reflection with group connection to stay grounded.",
    ],
    needsSudoku: false,
  },
  Extrovert: {
    label: "Extrovert",
    description: "You gain energy from interaction, collaboration, and active connection.",
    chatLabel: "1-on-1 chat and group chat",
    healthyTips: [
      "Look for active collaboration and social learning opportunities.",
      "Practice active listening so conversations stay balanced and supportive.",
      "Use networking and group engagement to stay motivated.",
      "Plan recovery moments so high social energy stays sustainable.",
    ],
    needsSudoku: false,
  },
};

export const normalizeText = (value) =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase();

export const uniqueInterests = (interests = []) =>
  Array.from(
    new Set(
      (Array.isArray(interests) ? interests : [])
        .map((interest) => (interest || "").toString().trim())
        .filter(Boolean)
    )
  );

const getBucketCounts = (interests = []) => {
  const counts = {
    Introvert: 0,
    Ambivert: 0,
    Extrovert: 0,
  };

  uniqueInterests(interests).forEach((interest) => {
    const normalized = normalizeText(interest);
    Object.entries(INTEREST_BUCKETS).forEach(([type, bucketInterests]) => {
      if (bucketInterests.some((bucketInterest) => normalizeText(bucketInterest) === normalized)) {
        counts[type] += 1;
      }
    });
  });

  return counts;
};

export const predictPersonalityFromInterests = (interests = []) => {
  const counts = getBucketCounts(interests);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [top, second] = sorted;

  if (!top || top[1] === 0) return "Ambivert";
  if (second && top[1] === second[1]) return "Ambivert";
  return top[0];
};

export const getHealthyTips = (personalityType) =>
  PERSONALITY_META[personalityType]?.healthyTips || PERSONALITY_META.Ambivert.healthyTips;

export const canCreateGroupChats = (personalityType) =>
  personalityType === "Ambivert" || personalityType === "Extrovert";

export const needsSudoku = (user) =>
  user?.personalityType === "Introvert" && !user?.sudokuCompleted;

export const resolvePersonalityFromAnswers = (answers = [], fallbackPersonality = "Ambivert") => {
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

export const getPostAuthRoute = (user) => {
  if (!user) return "/login-personal-info";
  if (!user?.assessmentCompleted || !user?.personalityType) return "/adaptive-quiz";
  if (needsSudoku(user)) return "/sudoku-puzzle";
  return "/personalized-dashboard";
};

export const getSharedInterests = (currentInterests = [], peerInterests = []) => {
  const peerLookup = new Set(uniqueInterests(peerInterests).map(normalizeText));
  return uniqueInterests(currentInterests).filter((interest) =>
    peerLookup.has(normalizeText(interest))
  );
};

export const buildMatchSummary = (currentUser, peer) => {
  const sharedInterests = getSharedInterests(currentUser?.interests, peer?.interests);
  const samePersonality = currentUser?.personalityType && peer?.personalityType
    ? currentUser.personalityType === peer.personalityType
    : false;

  const compatibilityScore = Math.min(
    99,
    (samePersonality ? 65 : 20) + sharedInterests.length * 12
  );

  return {
    sharedInterests,
    samePersonality,
    compatibilityScore,
    personalityTags: samePersonality
      ? [peer.personalityType, "Same personality type"]
      : [peer.personalityType || "Pending assessment"],
  };
};
