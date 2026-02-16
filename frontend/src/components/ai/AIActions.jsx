import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/ai.service.js";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer.jsx";
import Modal from "../common/Modal.jsx";

const AIActions = () => {
  const { documentId } = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const response = await aiService.generateSummary(documentId);

      let contentString = "";
      if (typeof response === "string") {
        contentString = response;
      } else if (response && typeof response === "object") {
        contentString =
          response.summary ||
          response.content ||
          response.text ||
          JSON.stringify(response);
      }

      setModalTitle("Generated Summary");
      setModalContent(contentString);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Summary Error:", error);
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }

    setLoadingAction("explain");
    try {
      const response = await aiService.explainConcept(documentId, concept);

      let contentString = "";
      if (typeof response === "string") {
        contentString = response;
      } else if (response && typeof response === "object") {
        contentString =
          response.explanation ||
          response.content ||
          response.text ||
          JSON.stringify(response);
      }

      setModalTitle(`Explanation of "${concept}"`);
      setModalContent(contentString);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      console.error("Explain Error:", error);
      toast.error("Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      {/* Main Container - Adjusted height usage */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
        {/* Header Section - Compact Padding */}
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Assistant</h3>
              <p className="text-xs text-slate-500 font-medium">
                Powered by advanced AI
              </p>
            </div>
          </div>
        </div>

        {/* Content Section - Reduced spacing to fit screen */}
        <div className="p-6 py-5 space-y-5 flex-1">
          {/* Generate Summary Block */}
          <div className="p-5 py-6 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <BookOpen
                    className="w-5 h-5 text-blue-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-base font-bold text-slate-900 mb-0.5">
                    Generate Summary
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Get a concise summary of the entire document.
                  </p>
                </div>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="shrink-0 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-teal-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[120px]"
              >
                {loadingAction === "summary" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <span>Working...</span>
                  </>
                ) : (
                  "Summarize"
                )}
              </button>
            </div>
          </div>

          {/* Explain Concept Block */}
          <div className="p-5 py-6 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex gap-4 mb-5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Lightbulb
                  className="w-5 h-5 text-amber-500"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-base font-bold text-slate-900 mb-0.5">
                  Explain a Concept
                </h4>
                <p className="text-slate-500 text-sm">
                  Enter a topic or concept from the document to get a detailed
                  explanation.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleExplainConcept}
              className="flex flex-col md:flex-row gap-3"
            >
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., 'React Hooks'"
                className="flex-1 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm"
                disabled={loadingAction === "explain"}
              />
              <button
                type="submit"
                disabled={loadingAction === "explain" || !concept.trim()}
                className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-400/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[120px]"
              >
                {loadingAction === "explain" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <span>Working...</span>
                  </>
                ) : (
                  "Explain"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="max-h-[60vh] overflow-y-auto prose prose-slate prose-sm max-w-none leading-relaxed">
          <MarkdownRenderer content={modalContent} />
        </div>
      </Modal>
    </>
  );
};

export default AIActions;
