import React, { useState } from 'react';
import {
  MessagesSquare,
  ThumbsUp,
  Award,
  Send,
  PlusCircle,
  Search,
  CheckCircle2,
  CornerDownRight,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const DiscussionsView: React.FC = () => {
  const {
    discussions,
    courses,
    selectedCourseId,
    currentUser,
    createDiscussion,
    replyDiscussion,
    t,
  } = useLMS();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const course = courses.find(c => c.id === selectedCourseId) || courses[0];

  const filteredDiscussions = discussions.filter(
    d =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    await createDiscussion(course?.id || 'course-1', newTopicTitle, newTopicContent);
    setNewTopicTitle('');
    setNewTopicContent('');
    setShowNewTopicModal(false);
  };

  const handlePostReply = async (discId: string) => {
    const text = replyTextMap[discId];
    if (!text || !text.trim()) return;
    await replyDiscussion(discId, text);
    setReplyTextMap(prev => ({ ...prev, [discId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('discussions')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Collaborative academic forum, peer reviews, questions, and instructor endorsements.
          </p>
        </div>

        <button
          onClick={() => setShowNewTopicModal(true)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Discussion Thread</span>
        </button>
      </div>

      {/* Discussions Threads */}
      <div className="space-y-4">
        {filteredDiscussions.map(disc => (
          <div key={disc.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            {/* Thread Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <img
                  src={disc.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={disc.authorName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{disc.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-semibold text-slate-700">{disc.authorName}</span>
                    <span>•</span>
                    <span>{new Date(disc.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Thanks for upvoting!')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-sky-600" />
                  <span>{disc.upvotes}</span>
                </button>
              </div>
            </div>

            {/* Topic Content */}
            <p className="text-xs text-slate-700 leading-relaxed pl-12">
              {disc.content}
            </p>

            {/* Replies List */}
            {disc.replies && disc.replies.length > 0 && (
              <div className="pl-12 space-y-3 pt-3 border-t border-slate-100">
                {disc.replies.map(rep => (
                  <div key={rep.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{rep.authorName}</span>
                        {rep.isInstructorEndorsed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <Award className="w-3 h-3" /> Instructor Endorsed Answer
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rep.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Box */}
            <div className="pl-12 flex items-center gap-2 pt-2">
              <CornerDownRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Write a constructive response..."
                value={replyTextMap[disc.id] || ''}
                onChange={e => setReplyTextMap({ ...replyTextMap, [disc.id]: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter') handlePostReply(disc.id);
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500"
              />
              <button
                onClick={() => handlePostReply(disc.id)}
                className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl cursor-pointer"
                title="Send Reply"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Start Discussion Topic</h3>
            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Clarification on BCNF Normalization Algorithm"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discussion Details *</label>
                <textarea
                  rows={4}
                  required
                  value={newTopicContent}
                  onChange={e => setNewTopicContent(e.target.value)}
                  placeholder="Explain your thought process or question for peers and faculty..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTopicModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Post Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
