import { useState } from "react";
import Stage3Evidence from "./stages/Stage3Evidence.jsx";
export default function App() {
  const [result, setResult] = useState(null);
  return <><div className="preview-banner">STANDALONE PREVIEW — integrate this module into your team's app shell after testing.</div>
    <Stage3Evidence accessFinding={null} onComplete={setResult} />
    {result && <section className="result-preview"><h2>Callback result received</h2><pre>{JSON.stringify(result, null, 2)}</pre></section>}
  </>;
}