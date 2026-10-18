import { useMemo, useState } from "react";
import { evidenceArtifacts, evidenceManifest, evidenceTruth, sha256, verifyManifestEntry } from "../data/evidence.js";

const tabs = [["repository","Evidence files"],["compare","Compare versions"],["integrity","Integrity check"],["custody","Chain of custody"],["checkpoint","Submit findings"]];
const date = (value) => new Date(value).toLocaleString(undefined, { dateStyle:"medium", timeStyle:"medium", timeZone:"UTC" }) + " UTC";

export default function Stage3Evidence({ accessFinding = null, onComplete = () => {} }) {
  const [tab,setTab] = useState("repository"), [query,setQuery] = useState(""), [filter,setFilter] = useState("all");
  const [selectedId,setSelectedId] = useState("ev-roadmap-original"), [leftId,setLeftId] = useState("ev-roadmap-original"), [rightId,setRightId] = useState("ev-roadmap-modified");
  const [verifyId,setVerifyId] = useState("ev-roadmap-modified"), [verifyResult,setVerifyResult] = useState(null), [hashes,setHashes] = useState({});
  const [artifactAnswer,setArtifactAnswer] = useState(""), [weaknessAnswer,setWeaknessAnswer] = useState(""), [recordAnswer,setRecordAnswer] = useState("");
  const [note,setNote] = useState(""), [feedback,setFeedback] = useState(null), [complete,setComplete] = useState(false);
  const selected = evidenceArtifacts.find(x => x.id === selectedId);
  const left = evidenceArtifacts.find(x => x.id === leftId), right = evidenceArtifacts.find(x => x.id === rightId);
  const visible = useMemo(() => evidenceArtifacts.filter(x => {
    const text = [x.id,x.title,x.filename,x.source,x.content,x.owner].join(" ").toLowerCase();
    const match = !query || text.includes(query.toLowerCase());
    const filt = filter === "all" || (filter === "confidential" && x.classification === "Confidential") || (filter === "export" && x.source.includes("Export")) || (filter === "public" && x.classification === "Public");
    return match && filt;
  }), [query,filter]);

  async function calculate(id) {
    try { const hash = await sha256(evidenceArtifacts.find(x=>x.id===id).content); setHashes(old=>({...old,[id]:hash})); return hash; }
    catch(e) { setFeedback({type:"error",title:"Hash calculation failed",message:e.message}); return null; }
  }
  async function verify() {
    const result = await verifyManifestEntry(verifyId);
    setVerifyResult(result);
    setHashes(old=>({...old,[verifyId]:result.observedHash,["expected:"+verifyId]:result.expectedHash}));
  }
  async function submit(e) {
    e.preventDefault();
    if (artifactAnswer !== evidenceTruth.correctArtifactId || weaknessAnswer !== evidenceTruth.correctDiscrepancy || recordAnswer !== evidenceTruth.supportingRecordId) {
      setFeedback({type:"error",title:"Evidence is incomplete",message:"Inspect the successful export record and the excessive service-account permissions. A checksum mismatch alone does not prove exposure."}); return;
    }
    const hash = await calculate(artifactAnswer);
    const result = {
      provingArtifactIds:[artifactAnswer], discrepancy:weaknessAnswer, supportingRecordId:recordAnswer,
      explanation:note.trim(), source:"stage-3-evidence", completed:true, artifactHash:hash,
      evidenceSummary:"The synthetic export record documents a successful export of the restricted roadmap through svc-export-01 to Export Staging.",
      uncertainty:"The evidence does not establish which human initiated the workflow or whether the action was malicious."
    };
    setComplete(true);
    setFeedback({type:"success",title:"Evidence checkpoint passed",message:"Your finding cites the export record and preserves uncertainty around human identity and intent."});
    onComplete(result);
  }

  return <main className="ev-page">
    <header className="ev-header"><div><div className="ev-eyebrow">NOVACORP / DIGITAL FORENSICS</div><h1>The Evidence Vault</h1><p className="ev-subtitle">Case 07 · The Glasshouse Incident</p></div><div className="ev-live"><i/> SIMULATED CASE / ACTIVE</div></header>
    <section className="ev-brief"><b>!</b><div><h2>Investigation objective</h2><p>Identify the record supporting the exposure path, examine file integrity and preserve a defensible chain of custody. Distinguish what the evidence proves from what remains uncertain.</p></div></section>
    <section className="ev-stats"><div><span>ARTIFACTS</span><strong>{evidenceArtifacts.length}</strong><small>Fictional records</small></div><div><span>SELECTED VERSION</span><strong>{selected.version}</strong><small>{selected.id}</small></div><div><span>CHECKPOINT</span><strong>{complete?"PASSED":"OPEN"}</strong><small>{complete?"Finding submitted":"Awaiting conclusion"}</small></div></section>
    <nav className="ev-tabs">{tabs.map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}{id==="checkpoint"&&complete?" ✓":""}</button>)}</nav>

    {tab==="repository" && <section className="ev-workspace"><div className="ev-panel"><div className="ev-eyebrow">01 / REPOSITORY</div><h2>Available artifacts</h2>
      <label className="ev-label">Search records<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search ID, filename, source…"/></label>
      <label className="ev-label">Filter<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All records</option><option value="confidential">Confidential</option><option value="export">Export-related</option><option value="public">Public / decoy</option></select></label>
      <div className="ev-list">{visible.map(x=><button key={x.id} className={"ev-card "+(selectedId===x.id?"chosen":"")} onClick={()=>setSelectedId(x.id)}><span className="ev-pill">{x.category}</span><h3>{x.title}</h3><p>{x.filename}</p><small>{x.id} · {x.version}</small></button>)}{!visible.length&&<p className="ev-muted">No matching records.</p>}</div></div>
      <div className="ev-panel"><div className="ev-eyebrow">ARTIFACT INSPECTOR</div><h2>{selected.title}</h2><p className="ev-muted">{selected.exportStatus}</p><dl className="ev-details">{[["ID",selected.id],["Filename",selected.filename],["Source",selected.source],["Timestamp",date(selected.timestamp)],["Version",selected.version],["Owner",selected.owner],["Classification",selected.classification],["Repository",selected.repository]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><h3>Artifact contents</h3><pre className="ev-content">{selected.content.replaceAll("\\n","\n")}</pre><h3>Calculated SHA-256</h3><code className="ev-hash">{hashes[selected.id]||"Not calculated"}</code><button className="ev-primary" onClick={()=>calculate(selected.id)}>Calculate content hash</button></div></section>}

    {tab==="compare" && <section className="ev-panel"><div className="ev-eyebrow">02 / VERSION ANALYSIS</div><h2>Compare artifacts</h2><p className="ev-muted">A content or metadata difference is an investigative lead, not automatic proof of exposure.</p><div className="ev-compare"><label className="ev-label">Reference<select value={leftId} onChange={e=>setLeftId(e.target.value)}>{evidenceArtifacts.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label><label className="ev-label">Under review<select value={rightId} onChange={e=>setRightId(e.target.value)}>{evidenceArtifacts.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label></div><div className="ev-compare">{[left,right].map((x,i)=><article className="ev-version" key={i}><span className="ev-eyebrow">{i?"UNDER REVIEW":"REFERENCE"} / {x.version}</span><h3>{x.filename}</h3><p className="ev-muted">{x.source} · {date(x.timestamp)}</p><pre className="ev-content">{x.content.replaceAll("\\n","\n")}</pre><button className="ev-secondary" onClick={()=>calculate(x.id)}>Calculate SHA-256</button><code className="ev-hash">{hashes[x.id]||"Not calculated"}</code></article>)}</div><div className="ev-note"><strong>Analyst interpretation</strong><p>The modified roadmap has different contents from the original. That establishes an integrity difference in this simulation; the separate export record supports the exposure path.</p></div></section>}

    {tab==="integrity" && <section className="ev-panel"><div className="ev-eyebrow">03 / INTEGRITY ANALYSIS</div><h2>SHA-256 manifest check</h2><p className="ev-muted">The app computes SHA-256 from the exact fictional text payload. The modified artifact is checked against the original roadmap as its reference.</p><label className="ev-label">Artifact<select value={verifyId} onChange={e=>{setVerifyId(e.target.value);setVerifyResult(null)}}>{evidenceArtifacts.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label><button className="ev-primary narrow" onClick={verify}>Calculate and verify</button>{verifyResult&&<div className="ev-manifest"><div><span>Observed SHA-256</span><code>{verifyResult.observedHash}</code></div><div><span>Reference SHA-256</span><code>{verifyResult.expectedHash}</code></div><div><span>Result</span><strong className={verifyResult.matches?"match":"mismatch"}>{verifyResult.matches?"MATCH":"MISMATCH — INVESTIGATE"}</strong></div><p>{verifyResult.message}</p></div>}<div className="ev-note"><strong>Reference manifest</strong><p>{evidenceManifest.id} · generated {date(evidenceManifest.generatedAt)}. A mismatch does not alone establish exposure, exfiltration or a human actor's identity.</p></div></section>}

    {tab==="custody" && <section className="ev-panel"><div className="ev-eyebrow">04 / PROVENANCE</div><h2>Chain of custody</h2><p className="ev-muted">A synthetic timeline supplied for the exercise, not a real audit log.</p><div className="ev-timeline">{[["09:12:04 UTC","Original roadmap recorded","Research Repository","ev-roadmap-original"],["09:16:38 UTC","Modified copy appears in staging","Export Staging","ev-roadmap-modified"],["09:17:02 UTC","Successful export event recorded","Export Service","ev-roadmap-export"],["09:18:00 UTC","Reference manifest generated","Audit Records","ev-manifest-reference"]].map(([time,title,source,id])=><article key={id}><span>{time}</span><h3>{title}</h3><p>{source}</p><code>{id}</code>{id!=="ev-manifest-reference"&&<button className="ev-link" onClick={()=>{setSelectedId(id);setTab("repository")}}>Inspect record →</button>}</article>)}</div><div className="ev-note"><strong>Custody caution</strong><p>This timeline is fictional scenario data. It provides a sequence for analysis but does not authenticate real-world chain of custody.</p></div></section>}

    {tab==="checkpoint" && <section className="ev-panel"><div className="ev-eyebrow">05 / INVESTIGATION CHECKPOINT</div><h2>Submit findings</h2><p className="ev-muted">Select the strongest artifact, identify the weakness and cite the supporting record.</p>{accessFinding&&<div className="ev-note"><strong>Stage 2 handoff received</strong><p>Confirm identity and resource IDs with the shared case file before integration.</p><code>{JSON.stringify(accessFinding)}</code></div>}<form className="ev-form" onSubmit={submit}>
      <label>1. Artifact supporting the exposure path<select required value={artifactAnswer} onChange={e=>setArtifactAnswer(e.target.value)}><option value="">Choose…</option>{evidenceArtifacts.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
      <label>2. Technical weakness<select required value={weaknessAnswer} onChange={e=>setWeaknessAnswer(e.target.value)}><option value="">Choose…</option><option value="checksum-mismatch">A checksum mismatch alone proves theft</option><option value="excessive-permissions">Excessive service-account permissions enabled access</option><option value="public-copy">A public document proves confidential exposure</option></select></label>
      <label>3. Supporting record ID<select required value={recordAnswer} onChange={e=>setRecordAnswer(e.target.value)}><option value="">Choose…</option>{evidenceArtifacts.map(x=><option key={x.id} value={x.id}>{x.id} — {x.title}</option>)}</select></label>
      <label>Analyst note (optional)<textarea rows="4" value={note} onChange={e=>setNote(e.target.value)} placeholder="What does the evidence support, and what remains uncertain?"/></label>
      <button className="ev-primary" disabled={complete}>{complete?"Findings submitted ✓":"Validate and submit findings →"}</button>
    </form>{feedback&&<div className={"ev-feedback "+feedback.type} role="status"><strong>{feedback.title}</strong><p>{feedback.message}</p></div>}<div className="ev-note"><strong>Evidence standard</strong><p>The records support a technical access-control failure and a recorded export. They do not establish which human initiated the workflow or whether it was malicious.</p></div></section>}
    <footer className="ev-footer"><span>CASE 07 / THE GLASSHOUSE INCIDENT</span><span>FICTIONAL FORENSIC SIMULATION</span></footer>
  </main>;
}