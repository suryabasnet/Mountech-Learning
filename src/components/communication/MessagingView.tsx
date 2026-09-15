import React, { useState } from 'react';
import {
  Mail,
  Bell,
  Send,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const MessagingView: React.FC = () => {
  const {
    messages,
    notifications,
    sendDirectMessage,
    currentUser,
    allUsers,
    markNotificationsRead,
    t,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<'inbox' | 'notifications'>('inbox');
  const [selectedMsgId, setSelectedMsgId] = useState<string>(messages[0]?.id || '');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Compose modal state
  const [recipientId, setRecipientId] = useState('user-teacher-1');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const activeMessage = messages.find(m => m.id === selectedMsgId) || messages[0];

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeMessage) return;
    const recipient = allUsers.find(u => u.id === (activeMessage.senderId === currentUser?.id ? activeMessage.recipientId : activeMessage.senderId));
    await sendDirectMessage(
      recipient?.id || 'user-teacher-1',
      recipient?.name || 'Instructor',
      `Re: ${activeMessage.subject}`,
      replyText
    );
    setReplyText('');
  };

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    const recipient = allUsers.find(u => u.id === recipientId);
    await sendDirectMessage(
      recipientId,
      recipient?.name || 'Recipient',
      subject,
      body
    );
    setSubject('');
    setBody('');
    setShowComposeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('messages')} & Communication</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Direct institutional messaging between faculty, students, and advisors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'inbox' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
              }`}
            >
              Direct Messages ({messages.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('notifications');
                markNotificationsRead();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'notifications' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600'
              }`}
            >
              Notifications ({notifications.length})
            </button>
          </div>

          {activeTab === 'inbox' && (
            <button
              onClick={() => setShowComposeModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Compose</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'inbox' ? (
        /* Split Pane: Conversations List & Chat Content */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[500px]">
          {/* Left Column: Messages List (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-100 divide-y divide-slate-100 overflow-y-auto">
            {messages.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelectedMsgId(msg.id)}
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                  selectedMsgId === msg.id ? 'bg-sky-50/70 border-l-4 border-sky-600' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 truncate">{msg.senderName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate">{msg.subject}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{msg.body}</p>
              </div>
            ))}
          </div>

          {/* Right Column: Message Detail & Reply Box (8 cols) */}
          <div className="lg:col-span-8 p-6 flex flex-col justify-between">
            {activeMessage ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{activeMessage.subject}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      From: <span className="font-semibold text-slate-800">{activeMessage.senderName}</span> • To: <span className="font-semibold text-slate-800">{activeMessage.recipientName}</span>
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(activeMessage.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {activeMessage.body}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Select a message to read.
              </div>
            )}

            {/* Quick Reply Form */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendReply();
                }}
                placeholder="Type a direct reply to faculty or student..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500"
              />
              <button
                onClick={handleSendReply}
                className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl cursor-pointer"
                title="Send Reply"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Notifications Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {notifications.map(notif => (
            <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Compose Direct Message</h3>
            <form onSubmit={handleCompose} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient *</label>
                <select
                  value={recipientId}
                  onChange={e => setRecipientId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Question regarding Lab 3 submission deadline"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Type your message clearly..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
