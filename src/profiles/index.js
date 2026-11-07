/**
 * Limitless Claude 7.0 - Provider Profiles Registry
 */

const nativeProfile = require("./native");
const limitlessProfile = require("./limitless");
const opencodeGoProfile = require("./opencode-go");
const opencodeZenProfile = require("./opencode-zen");
const openrouterProfile = require("./openrouter");
const antigravityProfile = require("./antigravity");

const ALL_PROFILES = [
  nativeProfile,
  limitlessProfile,
  opencodeGoProfile,
  opencodeZenProfile,
  openrouterProfile,
  antigravityProfile
];

const PROFILES_MAP = new Map(ALL_PROFILES.map(p => [p.id, p]));

function getProfile(id) {
  if (!id) return limitlessProfile;
  return PROFILES_MAP.get(String(id).toLowerCase()) || null;
}

function listProfiles() {
  return ALL_PROFILES.map(p => ({
    id: p.id,
    displayName: p.displayName,
    description: p.description,
    billingType: p.billingType,
    targetBaseUrl: p.targetBaseUrl
  }));
}

module.exports = {
  ALL_PROFILES,
  PROFILES_MAP,
  getProfile,
  listProfiles,
  nativeProfile,
  limitlessProfile,
  opencodeGoProfile,
  opencodeZenProfile,
  openrouterProfile,
  antigravityProfile
};
