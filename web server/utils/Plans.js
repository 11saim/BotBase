const PLANS = {
  free: {
    id: "free",
    label: "Free",
    price: 0,
    priceLabel: "Free",

    limits: {
      bots: 1,
      messagesPerMonth: 100,
      totalSources: 1,
    },

    features: {
      unansweredQuestionGaps: false,
      chatbotCustomization: true,
      trainingHistory: true,
    },
  },

  starter: {
    id: "starter",
    label: "Starter",
    price: 15,
    priceLabel: "$15/mo",

    limits: {
      bots: 3,
      messagesPerMonth: 2000,
      totalSources: 5,
    },

    features: {
      unansweredQuestionGaps: true,
      chatbotCustomization: true,
      trainingHistory: true,
    },
  },

  pro: {
    id: "pro",
    label: "Pro",
    price: 30,
    priceLabel: "$30/mo",

    limits: {
      bots: 10,
      messagesPerMonth: 10000,
      totalSources: 15,
    },

    features: {
      unansweredQuestionGaps: true,
      chatbotCustomization: true,
      trainingHistory: true,
    },
  },

  agency: {
    id: "agency",
    label: "Agency",
    price: 150,
    priceLabel: "$150/mo",

    limits: {
      bots: 15,
      messagesPerMonth: 50000,
      totalSources: 30,
    },

    features: {
      unansweredQuestionGaps: true,
      chatbotCustomization: true,
      trainingHistory: true,
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get the full plan config for a user's plan.
 * @param {string} planId - e.g. "free", "pro"
 */
const getPlan = (planId) => {
  const plan = PLANS[planId];
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  return plan;
};

/**
 * Get just the limits for a plan.
 * Usage: const { bots, messagesPerMonth } = getLimits(user.plan);
 */
const getLimits = (planId) => getPlan(planId).limits;

/**
 * Get just the features for a plan.
 * Usage: const { unansweredQuestionGaps } = getFeatures(user.plan);
 */
const getFeatures = (planId) => getPlan(planId).features;

/**
 * Check if a usage value is within the plan limit.
 * Handles -1 as unlimited.
 * Usage: canDo(user.plan, "totalSources", currentUsage)
 *
 * @param {string} planId
 * @param {string} limitKey  - key from limits object e.g. "bots", "totalSources"
 * @param {number} currentUsage
 */
const canDo = (planId, limitKey, currentUsage) => {
  const limit = getLimits(planId)[limitKey];
  if (limit === -1) return true;
  return currentUsage < limit;
};

/**
 * Check if a plan has access to a specific feature.
 * Usage: hasFeature(user.plan, "unansweredQuestionGaps")
 *
 * @param {string} planId
 * @param {string} featureKey - key from features object
 */
const hasFeature = (planId, featureKey) => {
  return getFeatures(planId)[featureKey] === true;
};

/**
 * How close is the user to a limit (0–100)?
 * Useful for "80% warning" logic in ActivityLog.
 * Returns null if unlimited.
 */
const usagePercent = (planId, limitKey, currentUsage) => {
  const limit = getLimits(planId)[limitKey];
  if (limit === -1) return null;
  return Math.round((currentUsage / limit) * 100);
};

const getPlanLimit = (planId, limitKey) => {
  const limit = getLimits(planId)[limitKey];
  if (limit === undefined) throw new Error(`Unknown limit key: ${limitKey}`);
  return limit;
};

module.exports = {
  PLANS,
  getPlan,
  getLimits,
  getFeatures,
  canDo,
  getPlanLimit,
  hasFeature,
  usagePercent,
};