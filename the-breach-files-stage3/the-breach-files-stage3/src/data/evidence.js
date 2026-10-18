// Fictional evidence records for the training simulation only.
export const evidenceArtifacts = [
  {
    id: "ev-roadmap-original", title: "Product Roadmap — Original",
    filename: "roadmap_v1.txt", category: "CONFIDENTIAL",
    source: "Research Repository", timestamp: "2026-10-14T09:12:04Z",
    version: "v1.0", owner: "Research Division", classification: "Confidential",
    repository: "Research Vault",
    content: "Project Glasshouse — confidential roadmap\\nLaunch planning: restricted\\nResearch milestones: internal",
    exportStatus: "Original record"
  },
  {
    id: "ev-roadmap-modified", title: "Product Roadmap — Modified",
    filename: "roadmap_v1_revised.txt", category: "MODIFIED",
    source: "Export Staging", timestamp: "2026-10-14T09:16:38Z",
    version: "v1.1", owner: "Export Integration", classification: "Confidential",
    repository: "Export Staging",
    content: "Project Glasshouse — confidential roadmap\\nLaunch planning: restricted\\nResearch milestones: revised copy",
    exportStatus: "Integrity discrepancy to investigate"
  },
  {
    id: "ev-roadmap-export", title: "Roadmap Export Record",
    filename: "export_manifest_074.txt", category: "KEY EVIDENCE",
    source: "Export Service", timestamp: "2026-10-14T09:17:02Z",
    version: "record-074", owner: "Export Service", classification: "Internal audit record",
    repository: "Audit Records",
    content: "event_id: record-074\\nidentity: svc-export-01\\nresource: res-research-roadmap\\naction: EXPORT\\nresult: SUCCESS\\ndestination: Export Staging",
    exportStatus: "Successful export recorded"
  },
  {
    id: "ev-public-copy", title: "Public Product Summary",
    filename: "public_summary.txt", category: "DECOY",
    source: "Public Documents", timestamp: "2026-10-14T08:40:11Z",
    version: "v2.0", owner: "Communications", classification: "Public",
    repository: "Public Documents",
    content: "Public product overview\\nGeneral launch announcement\\nNo restricted research milestones",
    exportStatus: "Public document"
  }
];

export const evidenceManifest = {
  id: "ev-manifest-reference",
  generatedAt: "2026-10-14T09:18:00Z",
  // The modified file is compared with the original roadmap reference.
  referenceArtifactId: "ev-roadmap-original"
};

export const evidenceTruth = {
  correctArtifactId: "ev-roadmap-export",
  correctDiscrepancy: "excessive-permissions",
  supportingRecordId: "ev-roadmap-export"
};

export function getEvidenceById(id) {
  return evidenceArtifacts.find((item) => item.id === id) ?? null;
}

export async function sha256(text) {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto unavailable. Run the app through Vite in a modern browser.");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyManifestEntry(id) {
  const artifact = getEvidenceById(id);
  if (!artifact) return { found: false, matches: false };
  const reference = id === "ev-roadmap-modified"
    ? getEvidenceById("ev-roadmap-original").content
    : artifact.content;
  const [observedHash, expectedHash] = await Promise.all([
    sha256(artifact.content), sha256(reference)
  ]);
  return {
    found: true, matches: observedHash === expectedHash,
    observedHash, expectedHash,
    message: observedHash === expectedHash
      ? "Calculated SHA-256 matches the reference content."
      : "Calculated SHA-256 differs from the reference content. This is an integrity lead, not standalone proof of exposure."
  };
}