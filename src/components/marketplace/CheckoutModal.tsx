import React, { useState } from 'react';
import { Course } from '../../types';
import { useLMS } from '../../context/LMSContext';
import { X, CreditCard, Lock, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  course: Course | null;
  onClose: () => void;
  onSuccess: (courseId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ course, onClose, onSuccess }) => {
  const { checkoutCourse, currentUser } = useLMS();
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<any | null>(null);

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [cardholderName, setCardholderName] = useState(currentUser?.name || 'Aarav Basnet');

  if (!course) return null;

  const price = course.price ?? 0;
  const isFree = price === 0;

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const result = await checkoutCourse(course.id, {
        cardNumber: cardNumber.replace(/\D/g, '') || '4242424242424242',
        cardholderName,
      });

      if (result.success) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        setCompletedTransaction(result.transaction || { free: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {isFree ? 'Course Enrollment' : 'Stripe Secure Checkout'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedTransaction ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">
              {isFree ? 'Successfully Enrolled!' : 'Payment Completed!'}
            </h3>
            
            <p className="text-sm text-slate-600">
              You now have unlimited self-paced access to <strong>{course.title}</strong>.
            </p>

            {!isFree && completedTransaction.id && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono font-medium text-slate-700">{completedTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Charged:</span>
                  <span className="font-semibold text-slate-900">${price.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-emerald-600 uppercase">{completedTransaction.status || 'Succeeded'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Processor:</span>
                  <span className="font-medium text-slate-700">Stripe Payments (Cloud Verified)</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                id="start-course-btn"
                onClick={() => {
                  onSuccess(course.id);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
              >
                Start Learning Now
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleEnroll} className="p-6 space-y-5">
            {/* Course Summary Card */}
            <div className="flex gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                    {course.code}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-1">
                    {course.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Instructor: {course.primaryTeacherName}</span>
                  <span className={`font-bold ${isFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isFree ? 'FREE' : `$${price.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="border-t border-b border-slate-100 py-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Course Tuition</span>
                <span>{isFree ? '$0.00' : `$${price.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Certificate of Completion Included</span>
                <span className="text-emerald-600 font-medium">Included ($0)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Full Lifetime Access</span>
                <span className="text-emerald-600 font-medium">Yes</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200/60">
                <span>Total Due</span>
                <span className={isFree ? 'text-emerald-600' : 'text-slate-900'}>
                  {isFree ? 'FREE' : `$${price.toFixed(2)} USD`}
                </span>
              </div>
            </div>

            {/* Stripe Payment Fields (if not free) */}
            {!isFree && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    Card Information
                  </label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    256-Bit Encrypted
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="Card number"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      placeholder="MM / YY"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      value={cvc}
                      onChange={e => setCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={e => setCardholderName(e.target.value)}
                      placeholder="Full name as shown on card"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payments secured by Stripe. 14-day money-back guarantee.</span>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                id="submit-checkout-btn"
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 px-4 font-semibold text-sm rounded-xl text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  isFree
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-sky-600 hover:bg-sky-700'
                } disabled:opacity-50`}
              >
                {isProcessing ? (
                  <span>Processing with Stripe...</span>
                ) : isFree ? (
                  <span>Enroll in Course — Free</span>
                ) : (
                  <span>Pay ${price.toFixed(2)} & Start Learning</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
