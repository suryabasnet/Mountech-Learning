import React, { useState } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Layers,
  Award,
  PlusCircle,
  CheckCircle2,
  Lock,
  Star,
  Clock,
  PlayCircle,
  Trophy
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { CourseEditorModal } from './CourseEditorModal';

export const CourseCatalog: React.FC = () => {
  const {
    courses,
    currentUser,
    setSelectedCourseId,
    setActiveView,
    t,
  } = useLMS();

  const [activeTab, setActiveTab] = useState<'all' | 'specializations' | 'certificates'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const canCreate = currentUser?.role === 'teacher' || currentUser?.role === 'institution_admin' || currentUser?.role === 'super_admin';

  const publishedCourses = courses.filter(c => c.status === 'published');

  const filteredCourses = publishedCourses.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.primaryTeacherName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Mock featured/hero course
  const featuredCourse = publishedCourses.find(c => c.rating && c.rating >= 4.8) || publishedCourses[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Explore the Catalog</h2>
          <p className="text-sm text-slate-500 mt-1">
            Discover world-class courses, specializations, and professional certificates.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        )}
      </div>

      {/* Featured Hero (Coursera Style) */}
      {featuredCourse && !searchTerm && activeTab === 'all' && (
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <div className="md:w-1/2 p-8 md:p-12 relative z-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4 self-start">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>Professional Certificate</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              {featuredCourse.title}
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base mb-8 max-w-lg">
              {featuredCourse.description}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => { setSelectedCourseId(featuredCourse.id); setActiveView('public_syllabus'); }}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-900/50 transition-all"
              >
                Enroll Now
              </button>
              <div className="text-slate-300 text-xs font-semibold flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" />
                {featuredCourse.enrolledStudentsCount?.toLocaleString() || '12,450'} already enrolled
              </div>
            </div>
          </div>

          <div className="md:w-1/2 relative min-h-[300px]">
            <img src={featuredCourse.thumbnail} alt={featuredCourse.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Navigation & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-16 z-20 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            All Courses
          </button>
          <button
            onClick={() => setActiveTab('specializations')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'specializations' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            <Layers className="w-3.5 h-3.5" /> Specializations
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'certificates' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            <Award className="w-3.5 h-3.5" /> Professional Certificates
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="What do you want to learn?"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Popular Right Now</h3>
        
        {filteredCourses.length === 0 ? (
          <div className="py-20 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No courses found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setActiveView('public_syllabus');
                }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Course Image */}
                <div className="h-40 relative overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-bold text-slate-900 shadow-xs">
                    {course.code}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Meta */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {course.level || 'Intermediate'}
                    </span>
                    {course.rating && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {course.rating} <span className="text-slate-400 font-normal">({course.reviewsCount || 0})</span>
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {course.title}
                  </h4>
                  
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${course.primaryTeacherName}`} alt="Instructor" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 truncate">{course.primaryTeacherName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{course.modulesCount * 2} weeks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{course.lessonsCount} lessons</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && <CourseEditorModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};
