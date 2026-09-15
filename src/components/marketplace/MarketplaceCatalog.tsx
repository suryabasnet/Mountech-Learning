import React, { useState, useMemo } from 'react';
import { useLMS } from '../../context/LMSContext';
import { Course } from '../../types';
import { CheckoutModal } from './CheckoutModal';
import {
  Search,
  Filter,
  Star,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Tag,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

export const MarketplaceCatalog: React.FC = () => {
  const {
    courses,
    currentUser,
    isEnrolled,
    setActiveView,
    setSelectedCourseId,
    submitCourseForReview,
    reviewCourseDecision,
  } = useLMS();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  
  // Modals state
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [reviewModalCourse, setReviewModalCourse] = useState<Course | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Filter courses based on user role and criteria
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Visibility rules
      if (currentUser?.role === 'student' && course.status !== 'published') {
        return false;
      }

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(q);
        const matchesCode = course.code.toLowerCase().includes(q);
        const matchesDesc = course.description.toLowerCase().includes(q);
        const matchesTeacher = course.primaryTeacherName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesDesc && !matchesTeacher) {
          return false;
        }
      }

      // Price filter
      const price = course.price ?? 0;
      if (priceFilter === 'free' && price > 0) return false;
      if (priceFilter === 'paid' && price === 0) return false;

      // Rating filter
      if (minRating > 0 && (course.rating ?? 5) < minRating) return false;

      // Level filter
      if (levelFilter !== 'all' && course.level !== levelFilter) return false;

      return true;
    });
  }, [courses, currentUser, search, priceFilter, minRating, levelFilter]);

  const stats = useMemo(() => {
    const total = courses.length;
    const freeCount = courses.filter(c => (c.price ?? 0) === 0).length;
    const paidCount = courses.filter(c => (c.price ?? 0) > 0).length;
    const pendingCount = courses.filter(c => c.status === 'pending_review').length;
    return { total, freeCount, paidCount, pendingCount };
  }, [courses]);

  const handleEnrollSuccess = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveView('course_workspace');
  };

  const handleCourseAction = (course: Course) => {
    if (isEnrolled(course.id)) {
      setSelectedCourseId(course.id);
      setActiveView('course_workspace');
    } else {
      setCheckoutCourse(course);
    }
  };

  const handleAdminDecision = async (courseId: string, decision: 'approve' | 'reject') => {
    setIsSubmittingReview(true);
    try {
      await reviewCourseDecision(courseId, decision, reviewNotes || (decision === 'approve' ? 'Approved for marketplace.' : 'Revision requested.'));
      setReviewModalCourse(null);
      setReviewNotes('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleInstructorSubmit = async (courseId: string) => {
    setIsSubmittingReview(true);
    try {
      await submitCourseForReview(courseId, reviewNotes || 'Submitted for curriculum review.');
      setReviewModalCourse(null);
      setReviewNotes('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Self-Paced Learning Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Learn In-Demand Skills at Your Own Pace
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Enroll in hands-on computer science, algorithms, and engineering courses. Complete interactive quizzes, build projects, and earn verified credentials from Mountech Solutions.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                {stats.total}
              </div>
              <div>
                <p className="font-bold text-slate-900">{stats.total} Available Courses</p>
                <p className="text-slate-400 text-[11px]">Self-paced modules</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                {stats.freeCount}
              </div>
              <div>
                <p className="font-bold text-slate-900">{stats.freeCount} Free Courses</p>
                <p className="text-slate-400 text-[11px]">100% free enrollment</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Verified Certificates</p>
                <p className="text-slate-400 text-[11px]">Shareable on LinkedIn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner element */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-sky-50 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Admin Approval Queue Notice (If pending courses exist and user is admin) */}
      {(currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin') && stats.pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                {stats.pendingCount} Course{stats.pendingCount > 1 ? 's' : ''} Pending Marketplace Review
              </h4>
              <p className="text-xs text-amber-800">
                Instructors have submitted new course curricula awaiting administrative approval.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const pendingCourse = courses.find(c => c.status === 'pending_review');
              if (pendingCourse) setReviewModalCourse(pendingCourse);
            }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Review Submissions
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by course title, code, instructor, or topic..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Price Selector */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                priceFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                priceFilter === 'free'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setPriceFilter('paid')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                priceFilter === 'paid'
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid Courses
            </button>
          </div>

          {/* Rating Filter */}
          <select
            value={minRating}
            onChange={e => setMinRating(Number(e.target.value))}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value={0}>All Ratings</option>
            <option value={4.0}>4.0 ★ & Above</option>
            <option value={4.5}>4.5 ★ & Above</option>
            <option value={4.8}>4.8 ★ & Above</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => {
          const enrolled = isEnrolled(course.id);
          const price = course.price ?? 0;
          const isFree = price === 0;

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Course Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                  {/* Status / Level Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm rounded">
                      {course.code}
                    </span>
                    {course.status !== 'published' && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        course.status === 'pending_review'
                          ? 'bg-amber-500 text-white'
                          : course.status === 'rejected'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-700 text-white'
                      }`}>
                        {course.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md ${
                      isFree
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-slate-900'
                    }`}>
                      {isFree ? 'FREE' : `$${price.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-sky-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                      <span className="font-bold text-slate-900">{course.rating || '5.0'}</span>
                    </div>
                    <span className="text-slate-400">
                      ({course.reviewsCount || 0} reviews)
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">
                      {course.enrolledStudentsCount || 0} learners
                    </span>
                  </div>

                  {/* Instructor & Meta */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">Instructor: <strong className="text-slate-700">{course.primaryTeacherName}</strong></span>
                    <span className="text-[11px] text-slate-400">{course.lessonsCount} lessons</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  id={`action-btn-${course.id}`}
                  onClick={() => handleCourseAction(course)}
                  className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 ${
                    enrolled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : isFree
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-sky-600 hover:bg-sky-700 text-white'
                  }`}
                >
                  {enrolled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Enrolled • Go to Course
                    </>
                  ) : isFree ? (
                    'Enroll Free'
                  ) : (
                    `Enroll for $${price.toFixed(2)}`
                  )}
                </button>

                {/* Review status buttons for instructors/admins */}
                {currentUser?.role === 'teacher' && course.status === 'draft' && (
                  <button
                    onClick={() => setReviewModalCourse(course)}
                    className="px-2.5 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                    title="Submit for admin marketplace review"
                  >
                    Submit Review
                  </button>
                )}

                {(currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin') && course.status === 'pending_review' && (
                  <button
                    onClick={() => setReviewModalCourse(course)}
                    className="px-2.5 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                    title="Evaluate submission"
                  >
                    Evaluate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No Courses Match Your Filter</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search keywords or resetting price and rating criteria.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setPriceFilter('all');
              setMinRating(0);
            }}
            className="px-4 py-2 text-xs font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Stripe Checkout Modal */}
      <CheckoutModal
        course={checkoutCourse}
        onClose={() => setCheckoutCourse(null)}
        onSuccess={handleEnrollSuccess}
      />

      {/* Course Review & Approval Workflow Modal */}
      {reviewModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {currentUser?.role === 'teacher'
                ? 'Submit Course for Marketplace Accreditation'
                : 'Administrative Review & Publishing'}
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><strong>Course:</strong> {reviewModalCourse.code} — {reviewModalCourse.title}</p>
              <p><strong>Instructor:</strong> {reviewModalCourse.primaryTeacherName}</p>
              <p><strong>Tuition:</strong> {(reviewModalCourse.price ?? 0) === 0 ? 'Free' : `$${reviewModalCourse.price?.toFixed(2)}`}</p>
              {reviewModalCourse.reviewNotes && (
                <p className="text-amber-800 pt-1">
                  <strong>Notes:</strong> {reviewModalCourse.reviewNotes}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {currentUser?.role === 'teacher' ? 'Notes for Reviewers' : 'Evaluation Feedback / Decision Note'}
              </label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Include syllabus alignment, quiz pass criteria, or revision requests..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModalCourse(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>

              {currentUser?.role === 'teacher' ? (
                <button
                  onClick={() => handleInstructorSubmit(reviewModalCourse.id)}
                  disabled={isSubmittingReview}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit for Review'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAdminDecision(reviewModalCourse.id, 'reject')}
                    disabled={isSubmittingReview}
                    className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg disabled:opacity-50"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => handleAdminDecision(reviewModalCourse.id, 'approve')}
                    disabled={isSubmittingReview}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
                  >
                    Approve & Publish to Marketplace
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
