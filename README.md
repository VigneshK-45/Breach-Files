# The Breach Files — Stage 3 Evidence Vault

Standalone React + Vite preview for Person 3.

## Run in GitHub Codespaces
```bash
npm install
npm run dev -- --host 0.0.0.0
```
Open forwarded port 5173.

## Test production build
```bash
npm run build
```

## Files to copy into the team app
- `src/data/evidence.js`
- `src/stages/Stage3Evidence.jsx`
- `src/stages/Stage3Evidence.css`

## Integration
```jsx
<Stage3Evidence
  accessFinding={findings.access}
  onComplete={(result) => {
    // Store result as findings.evidence and unlock Stage 4
    // in the shared app shell.
  }}
/>
```
Only the app shell should control navigation and stage progression.

## IDs to align with teammates
- `ev-roadmap-original`
- `ev-roadmap-modified`
- `ev-roadmap-export`
- `ev-public-copy`
- `ev-manifest-reference`
- `svc-export-01`
- `res-research-roadmap`

Confirm exact IDs and Stage 2 result property names with the team before merging.

## Case logic
The synthetic export record supports the exposure path. A checksum mismatch is an integrity lead, not standalone proof of exposure. The scenario does not establish who initiated the workflow or whether it was malicious.
