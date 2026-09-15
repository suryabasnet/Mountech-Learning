import React, { useState } from 'react';
import {
  Megaphone,
  Pin,
  PlusCircle,
  Clock,
  Send,
  User,
  AlertCircle,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const AnnouncementsView: React.FC = () => {
  const {
    announcements,
    courses,
    selectedCourseId,
    currentUser,
    createAnnouncement,
    t,
  } = useLMS();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const course = courses.find(c => c.id === selectedCourseId);
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin';

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    await createAnnouncement(course?.id || 'course-1', newTitle, newContent, isPinned);
    setNewTitle('');
    setNewContent('');
    setIsPinned(false);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('announcements')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official department notices, lecture schedule shifts, and academic broadcasts.
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {announcements.map(item => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
              item.isPinned ? 'border-sky-300 bg-sky-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      <Pin className="w-3 h-3 fill-sky-800" /> Pinned
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-600">By {item.authorName}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 mt-3 leading-relaxed whitespace-pre-line">
              {item.content}
            </p>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Publish Course Announcement</h3>
            <form onSubmit={handlePost} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule Change for Lab 4"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Type official details for all enrolled students..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-announcement"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="pin-announcement" className="text-xs font-semibold text-slate-700">
                  Pin this announcement to top of course
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
