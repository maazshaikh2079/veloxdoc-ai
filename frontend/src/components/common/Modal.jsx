import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content - Restored size */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>

          <div className="mb-6 pr-10 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>

          <div className="text-slate-600 text-base leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
