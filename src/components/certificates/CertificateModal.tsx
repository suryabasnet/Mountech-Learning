import React from 'react';
import { Certificate } from '../../types';
import { Award, CheckCircle2, Download, Printer, Share2, X, ExternalLink, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Verified Certificate of Completion</h2>
              <p className="text-xs text-slate-500">ID: {certificate.certificateNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="celebrate-btn"
              onClick={triggerConfetti}
              className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5"
              title="Celebrate completion"
            >
              🎉 Celebrate
            </button>
            <button
              id="print-cert-btn"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              id="close-cert-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Frame */}
        <div className="p-6 sm:p-10 bg-slate-100 flex justify-center">
          <div 
            id="certificate-print-area"
            className="w-full max-w-2xl bg-white border-8 border-double border-slate-800 p-8 sm:p-12 shadow-lg relative text-center select-none"
          >
            {/* Guilloche Corner Accents */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

            {/* Institution Brand */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-lg">
                M
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                Mountech Solutions
              </span>
            </div>

            <p className="text-xs tracking-widest text-slate-400 uppercase font-semibold mb-6">
              Official Self-Paced Course Credential
            </p>

            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold tracking-tight mb-2">
              Certificate of Completion
            </h1>

            <p className="text-sm text-slate-500 italic mb-6">
              This is to certify that
            </p>

            {/* Student Name */}
            <div className="border-b-2 border-slate-900/40 pb-2 mb-6 inline-block min-w-[280px]">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-sky-950">
                {certificate.studentName}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-2">
              has successfully completed all modules, required quizzes, and assignments for the course:
            </p>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              {certificate.courseTitle}
            </h3>

            {certificate.grade && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold mb-8">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Performance: {certificate.grade}
              </div>
            )}

            {/* Signature & Verification Seal */}
            <div className="grid grid-cols-2 gap-8 items-end pt-8 border-t border-slate-200 mt-6">
              <div className="text-left">
                <div className="font-serif italic text-base text-slate-800 mb-1">
                  {certificate.instructorName}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold border-t border-slate-300 pt-1">
                  Lead Instructor / Author
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800 mb-1">
                  {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold border-t border-slate-300 pt-1">
                  Issue Date
                </div>
              </div>
            </div>

            {/* Credential ID and Verification Bar */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Authenticity & ID: <strong className="text-slate-600">{certificate.certificateNumber}</strong></span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">mountechsolutions.com/verify</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>This certificate is permanently stored on Mountech's cloud database.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
