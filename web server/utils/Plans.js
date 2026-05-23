// core/plans.js
// Single source of truth for all plan limits and features.
// User model stores only the plan name (e.g. "free").
// Everything else is derived from here.

const PLANS = {
  free: {
    id: "free",
    label: "Free",

    limits: {
      bots: 1,
      messagesPerMonth: 100,
      fileUploadsPerBot: 1,
      teamMembers: 1,
    },

    features: {
      leadCollection: false,
      customQAOverrides: false,
      unansweredQuestionGaps: false,
      chatbotCustomization: true,
      trainingHistory: true,
      analyticsLevel: "basic",  // "basic" | "full"
      apiAccess: false,
      whiteLabelWidget: false,
      teamCollaboration: false,
    },
  },

  starter: {
    id: "starter",
    label: "Starter",

    limits: {
      bots: 3,
      messagesPerMonth: 2000,
      fileUploadsPerBot: 5,
      teamMembers: 1,
    },

    features: {
      leadCollection: true,
      customQAOverrides: true,
      unansweredQuestionGaps: true,
      chatbotCustomization: true,
      trainingHistory: true,
      analyticsLevel: "basic",
      apiAccess: false,
      whiteLabelWidget: false,
      teamCollaboration: false,
    },
  },

  pro: {
    id: "pro",
    label: "Pro",

    limits: {
      bots: 10,
      messagesPerMonth: 10000,
      fileUploadsPerBot: 20,
      teamMembers: 3,
    },

    features: {
      leadCollection: true,
      customQAOverrides: true,
      unansweredQuestionGaps: true,
      chatbotCustomization: true,
      trainingHistory: true,
      analyticsLevel: "full",
      apiAccess: true,
      whiteLabelWidget: false,
      teamCollaboration: true,
    },
  },

  agency: {
    id: "agency",
    label: "Agency",

    limits: {
      bots: -1,    // -1 = unlimited
      messagesPerMonth: 50000,
      fileUploadsPerBot: -1,
      teamMembers: 10,
    },

    features: {
      leadCollection: true,
      customQAOverrides: true,
      unansweredQuestionGaps: true,
      chatbotCustomization: true,
      trainingHistory: true,
      analyticsLevel: "full",
      apiAccess: true,
      whiteLabelWidget: true,
      teamCollaboration: true,
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
 * Usage: const { apiAccess } = getFeatures(user.plan);
 */
const getFeatures = (planId) => getPlan(planId).features;

/**
 * Check if a usage value is within the plan limit.
 * Handles -1 as unlimited.
 * Usage: canDo(user.plan, "bots", currentBotCount)
 *
 * @param {string} planId
 * @param {string} limitKey  - key from limits object e.g. "bots"
 * @param {number} currentUsage
 */
const canDo = (planId, limitKey, currentUsage) => {
  const limit = getLimits(planId)[limitKey];
  if (limit === -1) return true;        // unlimited
  return currentUsage < limit;
};

/**
 * Check if a plan has access to a specific feature.
 * Usage: hasFeature(user.plan, "apiAccess")
 *
 * @param {string} planId
 * @param {string} featureKey - key from features object e.g. "apiAccess"
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

module.exports = {
  PLANS,
  getPlan,
  getLimits,
  getFeatures,
  canDo,
  hasFeature,
  usagePercent,
};