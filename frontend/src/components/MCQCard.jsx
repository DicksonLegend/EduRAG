import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export default function MCQCard({ question, showAnswer, selectedAnswer, onSelect }) {
    const isSubmitted = showAnswer && selectedAnswer;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
        >
            {/* Question */}
            <div className="flex gap-4 mb-6">
                <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-extrabold shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-shadow">
                    {question.id}
                </span>
                <p className="text-lg font-bold text-slate-200 leading-relaxed pt-1">{question.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 sm:pl-14">
                {question.options.map((opt, index) => {
                    const isSelected = selectedAnswer === opt.label;
                    const isCorrect = showAnswer && opt.label === question.correct_answer;
                    const isWrong = showAnswer && isSelected && opt.label !== question.correct_answer;

                    let optionStyle = 'border-white/5 bg-[#111827] hover:border-indigo-500/30 hover:bg-indigo-500/5 text-slate-300';
                    let labelStyle = 'border-slate-700 text-slate-500 bg-white/5';
                    
                    if (isCorrect) {
                        optionStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
                        labelStyle = 'border-emerald-500 text-emerald-400 bg-emerald-500/20';
                    } else if (isWrong) {
                        optionStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-100';
                        labelStyle = 'border-rose-500 text-rose-400 bg-rose-500/20';
                    } else if (isSelected) {
                        optionStyle = 'border-indigo-500/50 bg-indigo-500/10 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.1)]';
                        labelStyle = 'border-indigo-500 text-indigo-400 bg-indigo-500/20';
                    }

                    return (
                        <motion.button
                            whileHover={!showAnswer ? { scale: 1.01, x: 4 } : {}}
                            whileTap={!showAnswer ? { scale: 0.99 } : {}}
                            key={opt.label}
                            onClick={() => !showAnswer && onSelect?.(opt.label)}
                            disabled={showAnswer}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${optionStyle} disabled:cursor-default`}
                        >
                            <span className={`w-8 h-8 rounded-xl border-2 flex-shrink-0 flex items-center justify-center text-sm font-bold transition-colors ${labelStyle}`}>
                                {isCorrect ? <CheckCircle2 size={16} /> : isWrong ? <XCircle size={16} /> : opt.label}
                            </span>
                            <span className="text-base font-medium">{opt.text}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Explanation */}
            {showAnswer && question.explanation && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 sm:ml-14 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                    <div className="flex gap-3">
                        <Info size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-indigo-300 mb-1 tracking-wide uppercase">Explanation</p>
                            <p className="text-base text-slate-300 leading-relaxed font-medium">{question.explanation}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
