import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "AGENTS.md",
  ".vendre/skills/setup.md",
  ".vendre/knowledge/api-reference.md",
  "src/components/vendre/setup-notice-bar.tsx",
  "src/components/vendre/setup-wizard.tsx",
  "src/routes/vendre-setup.tsx",
  "src/routes/api/vendre/status.ts",
];

const missingFiles = requiredFiles.filter((file) => !existsSync(file));
if (missingFiles.length > 0) {
  throw new Error(`Mandatory Vendre setup files are missing: ${missingFiles.join(", ")}`);
}

const agents = readFileSync("AGENTS.md", "utf8");
const setup = readFileSync(".vendre/skills/setup.md", "utf8");
const shell = readFileSync("src/components/storefront/store-shell.tsx", "utf8");
const notice = readFileSync("src/components/vendre/setup-notice-bar.tsx", "utf8");

const checks = [
  [
    agents.startsWith("# FIRST ACTION ON EVERY NEW IMPORT: RUN `/.vendre/skills/setup.md`"),
    "AGENTS.md must make the repository setup file the first action on import",
  ],
  [agents.includes("MANDATORY ONBOARDING"), "AGENTS.md must retain mandatory onboarding"],
  [
    agents.includes("Never create or invoke a wrapper skill instead"),
    "AGENTS.md must require direct execution without a wrapper skill",
  ],
  [
    setup.includes("# Vendre connection setup") &&
      setup.includes("Step 0 — Order of operations") &&
      setup.includes("Step 5 — Confirm"),
    ".vendre/skills/setup.md must retain the complete executable setup procedure",
  ],
  [shell.includes("<SetupNoticeBar />"), "StoreShell must render SetupNoticeBar globally"],
  [notice.includes("if (isConfigured) return;"), "SetupNoticeBar must open while unconfigured"],
  [notice.includes("setOpen(true)"), "SetupNoticeBar must automatically open setup"],
  [notice.includes('fetch("/api/vendre/status"'), "SetupNoticeBar must verify server credentials"],
  [!notice.includes("setup-autoopened"), "Setup auto-open must not be limited to one display"],
];

const failures = checks.filter(([passed]) => !passed).map(([, message]) => message);
if (failures.length > 0) {
  throw new Error(`Mandatory Vendre setup invariant failed:\n- ${failures.join("\n- ")}`);
}

console.log("Vendre setup invariant verified.");