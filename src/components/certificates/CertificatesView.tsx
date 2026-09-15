import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import { CertificateModal } from './CertificateModal';
import { Certificate } from '../../types';
import { Award, CheckCircle2, Download, ExternalLink, Calendar, BookOpen, Sparkles } from 'lucide-react';

export const CertificatesView: React.FC = () => {
  const { certificates, courses, currentUser, issueCertificate, setActiveView, setSelectedCourseId } = useLMS();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [claimingCourseId, setClaimingCourseId] = useState<string | null>(null);

  // Filter certificates belonging to current user (or show all if admin/instructor)
  const userCerts = currentUser?.role === 'student'
    ? certificates.filter(c => c.studentId === currentUser.id)
    : certificates;

  const handleClaim = async (courseId: string) => {
    setClaimingCourseId(courseId);
    try {
      const newCert = await issueCertificate(courseId);
      if (newCert) {
        setSelectedCert(newCert);
      }
    } finally {
      setClaimingCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
            <Award className="w-3.5 h-3.5" />
            Official Credentials
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Certificates of Completion
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Verified digital credentials awarded upon complete course mastery, passing auto-graded quizzes, and fulfilling assignment criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('marketplace')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shadow-sm"
          >
            Browse Marketplace
          </button>
        </div>
      </div>

      {/* Certificates Grid */}
      {userCerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCerts.map(cert => (
            <div
              key={cert.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {cert.certificateNumber}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base line-clamp-2 mb-1">
                  {cert.courseTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Recipient: <strong className="text-slate-700 font-semibold">{cert.studentName}</strong>
                </p>
              </div>

              <div className="p-5 space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Instructor:</span>
                  <span className="font-medium text-slate-700">{cert.instructorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Issued On:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                {cert.grade && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Result:</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {cert.grade}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  id={`view-cert-${cert.id}`}
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  View Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No Certificates Earned Yet</h3>
          <p className="text-xs text-slate-500 mb-6">
            Finish all lessons and quizzes in your enrolled courses to automatically unlock your verified certificate of completion.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveView('marketplace')}
              className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
            >
              Explore Courses
            </button>
          </div>
        </div>
      )}

      {/* Instant Claim for Available Enrolled Courses */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Course Completion & Certificate Claiming
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Students can claim credentials once their coursework is satisfied. For evaluation, you can claim certificates for any active course below:
        </p>

        <div className="divide-y divide-slate-100">
          {courses.slice(0, 4).map(course => {
            const hasCert = certificates.some(c => c.courseId === course.id && (currentUser?.role !== 'student' || c.studentId === currentUser?.id));
            return (
              <div key={course.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {course.code}: {course.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Instructor: {course.primaryTeacherName} • {course.lessonsCount} lessons • {course.assignmentsCount} assignments
                  </p>
                </div>

                <div>
                  {hasCert ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Certificate Awarded
                    </span>
                  ) : (
                    <button
                      id={`claim-btn-${course.id}`}
                      onClick={() => handleClaim(course.id)}
                      disabled={claimingCourseId === course.id}
                      className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {claimingCourseId === course.id ? 'Issuing...' : 'Claim Certificate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      <CertificateModal
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
};
