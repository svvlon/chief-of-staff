"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DesignPage() {
  const [status, setStatus] = useState("idle"); // idle, capturing, discovering, generating, complete
  const [userInput, setUserInput] = useState("");
  const [report, setReport] = useState("");
  // const [file, setFile] = useState<File | null>(null);

  // const startDemo = () => {
  //   if (!userInput) {
  //     alert("Please enter a workflow description first!");
  //     return;
  //   }
  //   setStatus("capturing");
  //   setTimeout(() => setStatus("discovering"), 2000);
  //   setTimeout(() => setStatus("generating"), 4000);
  //   setTimeout(() => setStatus("complete"), 6000);
  // };

  const startDemo = async () => {
    // if (!userInput && !file) {
    if (!userInput) {
      alert("Please enter a workflow description first!");
      return;
    }
    setStatus("capturing");
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: userInput }),
      });
      const data = await res.json();
      if (data.error) {
        alert("Error: " + data.error);
        setStatus("idle");
        return;
      }
      setReport(data.report);
      setStatus("complete");
    } catch (err) {
      alert("Request failed: " + err);
      setStatus("idle");
    }
  };
  // const startDemo = async () => {
  //   if (!userInput && !file) {
  //     alert("Please enter a workflow description or upload a file!");
  //     return;
  //   }
  //   setStatus("capturing");
  //   try {
  //     let res;
  //     if (file) {
  //       const formData = new FormData();
  //       formData.append("file", file);
  //       res = await fetch("/api/process", { method: "POST", body: formData });
  //     } else {
  //       res = await fetch("/api/process", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ transcript: userInput }),
  //       });
  //     }
  //     const data = await res.json();
  //     if (data.error) {
  //       alert("Error: " + data.error);
  //       setStatus("idle");
  //       return;
  //     }
  //     setReport(data.report);
  //     setStatus("complete");
  //   } catch (err) {
  //     alert("Request failed: " + err);
  //     setStatus("idle");
  //   }
  // };

  const handleApprove = async () => {
    // (your existing insert-to-db logic, if any client-side — likely already done server-side in /api/process)
    const res = await fetch("/api/download-docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimization-report-${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus("idle");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b p-6 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">Chief of Staff (CoS)</h1>
        <div className={`px-4 py-1 rounded-full text-xs font-black border-2 ${status === 'complete' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-blue-100 border-blue-500 text-blue-700'}`}>
          STATUS: {status.toUpperCase()}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-[#0f172a] text-white p-8 flex flex-col gap-10 shadow-2xl">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Execution Pipeline</h2>
          <div className="space-y-8">
            <PipelineStep number="01" label="Workflow Capture Agent" active={status === 'capturing'} done={['discovering', 'generating', 'complete'].includes(status)} />
            <PipelineStep number="02" label="Workflow Discovery Agent" active={status === 'discovering'} done={['generating', 'complete'].includes(status)} />
            <PipelineStep number="03" label="Knowledge Management Agent" active={status === 'comparing'} done={['generating', 'complete'].includes(status)} />
            <PipelineStep number="04" label="Report Generation Agent" active={status === 'generating'} done={status === 'complete'} />
            <PipelineStep number="05" label="Human Approval" active={status === 'complete'} done={false} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-12 overflow-y-auto bg-[#f8fafc]">
          <div className="max-w-3xl mx-auto">
            {status === 'idle' ? (
              <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-500">
                <h3 className="text-xl font-bold mb-6 text-slate-800 text-center">Step 1: Capture Your Workflow</h3>
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="e.g. Describe your current onboarding process..."
                  className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg mb-6"
                />
                {/* <input
                  type="file"
                  accept=".docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mb-4 block w-full text-sm"
                /> */}
                <button 
                  onClick={startDemo}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 hover:shadow-2xl active:scale-95 transition-all"
                >
                  START OPTIMIZATION FLOW
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                {/* Agent Logs Box */}
                <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-200">
                  <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest italic">Live Activity Log</h3>
                  <div className="font-mono text-sm space-y-3 bg-slate-900 text-slate-300 p-6 rounded-2xl border-4 border-slate-800 min-h-[200px]">
                    <p className="text-blue-400 animate-pulse">Running: Workflow Capture Agent...</p>
                    {['discovering', 'generating', 'complete'].includes(status) && <p className="text-purple-400 font-bold">&gt; Discovery Agent: Mapping workflow to Knowledge Base...</p>}
                    {['generating', 'complete'].includes(status) && <p className="text-orange-400 font-bold">&gt; Report Agent: Creating optimization summary...</p>}
                    {status === 'complete' && <p className="text-green-400 font-black">&gt; PIPELINE COMPLETE. AWAITING HUMAN REVIEW.</p>}
                  </div>
                </div>

                {/* Final Report Step (Matches the flowchart's final box) */}
                {status === 'complete' && (
                  <div className="bg-white p-10 rounded-[2rem] shadow-2xl border-l-[12px] border-green-500 animate-in fade-in slide-in-from-right-10">
                    <h2 className="text-2xl font-black text-slate-900 mb-2 underline decoration-green-500 decoration-4 underline-offset-8">Optimization Report</h2>
                    <div className="text-slate-600 text-lg mb-8 mt-4 leading-relaxed">
                      {/* <span className="whitespace-pre-wrap">{report}</span> */}
                      <div className="text-slate-800 leading-relaxed space-y-4">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ children }) => (
                              <table className="w-full border-collapse border border-slate-300 my-4 text-sm">
                                {children}
                              </table>
                            ),
                            th: ({ children }) => (
                              <th className="border border-slate-300 bg-slate-100 px-3 py-2 text-left font-bold">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border border-slate-300 px-3 py-2 align-top">
                                {children}
                              </td>
                            ),
                            h1: ({ children }) => <h1 className="text-2xl font-black mt-6 mb-3">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
                            code: ({ children }) => (
                              <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto text-xs my-3">
                                <code>{children}</code>
                              </pre>
                            ),
                            p: ({ children }) => <p className="mb-2">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                          }}
                        >
                          {report}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={handleApprove} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-black hover:bg-green-700 transition">APPROVE & SAVE</button>
                      <button onClick={() => setStatus('idle')} className="flex-1 border-2 border-red-500 text-red-500 py-4 rounded-xl font-black hover:bg-red-50 transition">REJECT</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PipelineStep({ number, label, active, done }: { number: string; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-5 transition-all duration-500 ${active || done ? "opacity-100 scale-105" : "opacity-20"}`}>
      <span className={`text-xs font-black px-2 py-1 rounded border ${done ? 'border-green-500 text-green-500' : 'border-slate-500 text-slate-500'}`}>{number}</span>
      <p className={`font-bold tracking-tight ${active ? "text-blue-400 underline decoration-2 underline-offset-4" : done ? "text-green-500" : "text-slate-300"}`}>{label}</p>
      {active && <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />}
    </div>
  );
}