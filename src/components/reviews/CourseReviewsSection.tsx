import React, { useState } from 'react';
import { useLMS } from '../../context/LMSContext';
import { Star, MessageSquare, CheckCircle2, User as UserIcon } from 'lucide-react';

interface CourseReviewsSectionProps {
  courseId: string;
}

export const CourseReviewsSection: React.FC<CourseReviewsSectionProps> = ({ courseId }) => {
  const { reviews, addReview, isEnrolled, currentUser } = useLMS();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const courseReviews = reviews.filter(r => r.courseId === courseId);
  const avgRating = courseReviews.length > 0
    ? (courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length).toFixed(1)
    : '5.0';

  const userHasReviewed = courseReviews.some(r => r.studentId === currentUser?.id);
  const userEnrolled = isEnrolled(courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addReview(courseId, rating, comment.trim());
      if (res) {
        setComment('');
        setSuccessMessage('Thank you! Your verified student review has been published.');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-600" />
            Student Ratings & Reviews
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Feedback from learners who completed or are actively enrolled in this course.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200/80 px-4 py-2 rounded-xl">
          <div className="flex text-amber-500">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
              />
            ))}
          </div>
          <div className="text-xs">
            <strong className="text-sm font-bold text-slate-900">{avgRating}</strong>
            <span className="text-slate-500 ml-1">({courseReviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      {userEnrolled && !userHasReviewed && (
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Write a Course Review</span>
            
            {/* Star Selector */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-medium text-slate-600 ml-1.5">{rating} / 5</span>
            </div>
          </div>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your learning experience, what you liked about the modules, and advice for prospective students..."
            rows={3}
            className="w-full text-xs p-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 divide-y divide-slate-100">
        {courseReviews.length > 0 ? (
          courseReviews.map(rev => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {rev.studentAvatar ? (
                    <img
                      src={rev.studentAvatar}
                      alt={rev.studentName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                      {rev.studentName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{rev.studentName}</h4>
                    <p className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-9">
                {rev.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 italic">
            No student reviews yet. Be the first to review after enrolling!
          </div>
        )}
      </div>
    </div>
  );
};
