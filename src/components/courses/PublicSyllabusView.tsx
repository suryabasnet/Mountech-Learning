import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  User,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  PlayCircle,
  FileText,
  Star,
  Globe,
  Share2,
  BookmarkPlus
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { CourseReviewsSection } from '../reviews/CourseReviewsSection';

export const PublicSyllabusView: React.FC = () => {
  const {
    courses,
    selectedCourseId,
    enrollInCourse,
    setActiveView,
    switchUser,
    t,
  } = useLMS();

  const course = courses.find(c => c.id === selectedCourseId) || courses[0];
  const [sampleOpen, setSampleOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  if (!course) return null;

  const handleEnrollNow = async () => {
    setIsEnrolling(true);
    // Switch to a mock student view and enroll
    await switchUser('user-student-1');
    await enrollInCourse(course.id);
    setIsEnrolling(false);
    setActiveView('course_workspace');
  };

  const skillsGained = [
    'System Architecture', 'Database Design', 'API Development', 'React Integration', 'Deployment Strategies'
  ]; // Mock skills

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => setActiveView('catalog')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${course.coverImage || course.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(2px)' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-slate-900/40"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 md:p-12">
          
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                {course.code}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-300 text-[10px] font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                {course.educationLevel || 'Professional Certificate'}
              </span>
              <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                <Star className="w-4 h-4 fill-yellow-400" />
                {course.rating || 4.8} <span className="text-slate-400 font-normal underline">({(course.reviewsCount || 1240).toLocaleString()} reviews)</span>
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              {course.title}
            </h1>
            
            <p className="text-slate-300 text-sm md:text-base mb-8 max-w-2xl leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${course.primaryTeacherName}`} alt="Instructor" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700" />
                <span>Instructor: <span className="text-white font-bold">{course.primaryTeacherName}</span></span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Globe className="w-4 h-4 text-slate-400" />
                English
              </div>
            </div>
          </div>

          {/* Enrollment Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 flex flex-col h-full sticky top-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Enroll Today</h3>
            <p className="text-sm text-slate-600 mb-6">Gain access to all modules, graded assignments, and a verifiable certificate.</p>
            
            <div className="mb-6 space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div><strong className="text-slate-900">Flexible deadlines</strong><br/><span className="text-xs">Reset deadlines in accordance to your schedule.</span></div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div><strong className="text-slate-900">Shareable Certificate</strong><br/><span className="text-xs">Add to your LinkedIn profile.</span></div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div><strong className="text-slate-900">100% online</strong><br/><span className="text-xs">Start instantly and learn at your own schedule.</span></div>
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleEnrollNow}
                disabled={isEnrolling}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll for Free'}
                {!isEnrolling && <ArrowRight className="w-4 h-4" />}
              </button>
              <div className="text-center text-[10px] text-slate-500 mt-3 font-semibold">
                Financial aid available
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Content Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* What you'll learn */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What you'll learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(course.learningOutcomes && course.learningOutcomes.length > 0 ? course.learningOutcomes : [
                'Understand the core principles and architectural patterns of the subject matter.',
                'Apply theoretical knowledge to practical, real-world project scenarios.',
                'Analyze and optimize solutions using industry-standard tools and metrics.',
                'Develop a comprehensive portfolio project demonstrating mastery of the skills.'
              ]).map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 leading-relaxed">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Gained */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Skills you'll gain</h2>
            <div className="flex flex-wrap gap-2">
              {skillsGained.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-800 text-sm font-semibold rounded-full border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Syllabus Mock */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Syllabus Highlights</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(moduleNum => (
                <div key={moduleNum} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Module {moduleNum}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Foundations & Core Concepts part {moduleNum}</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    This module covers the essential building blocks required to master the upcoming advanced topics. You will complete interactive video lectures, reading assignments, and a formative quiz.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><PlayCircle className="w-4 h-4 text-slate-400" /> 4 videos</span>
                    <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-slate-400" /> 2 readings</span>
                    <span className="flex items-center gap-1"><Award className="w-4 h-4 text-slate-400" /> 1 quiz</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <CourseReviewsSection courseId={course.id} />
        </div>

        {/* Right Sidebar (Sticky) */}
        <div className="space-y-6 lg:pl-6">
           <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
             <h3 className="text-sm font-bold text-slate-900 mb-4">Course Details</h3>
             <ul className="space-y-4 text-sm">
               <li>
                 <strong className="block text-slate-900">Duration</strong>
                 <span className="text-slate-600">Approx. {course.modulesCount * 2} weeks to complete</span>
               </li>
               <li>
                 <strong className="block text-slate-900">Effort</strong>
                 <span className="text-slate-600">4-6 hours per week</span>
               </li>
               <li>
                 <strong className="block text-slate-900">Institution</strong>
                 <span className="text-slate-600">MounTech University</span>
               </li>
               <li>
                 <strong className="block text-slate-900">Subject</strong>
                 <span className="text-slate-600">{course.department || 'Computer Science'}</span>
               </li>
               <li>
                 <strong className="block text-slate-900">Language</strong>
                 <span className="text-slate-600">English, with subtitles</span>
               </li>
             </ul>
           </div>

           <div className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-sm font-bold text-slate-700">
             <div className="flex items-center gap-2"><Share2 className="w-4 h-4 text-slate-400"/> Share this Course</div>
           </div>
           <div className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-sm font-bold text-slate-700">
             <div className="flex items-center gap-2"><BookmarkPlus className="w-4 h-4 text-slate-400"/> Save for Later</div>
           </div>
        </div>
      </div>
    </div>
  );
};
