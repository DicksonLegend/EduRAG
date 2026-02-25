export default function MCQCard({ question, showAnswer, selectedAnswer, onSelect }) {
    const isSubmitted = showAnswer && selectedAnswer;

    return (
        <div className="glass-card p-5 animate-slide-in">
            {/* Question */}
            <div className="flex gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                    {question.id}
                </span>
                <p className="text-sm font-medium leading-relaxed">{question.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2 ml-10">
                {question.options.map((opt) => {
                    const isSelected = selectedAnswer === opt.label;
                    const isCorrect = showAnswer && opt.label === question.correct_answer;
                    const isWrong = showAnswer && isSelected && opt.label !== question.correct_answer;

                    let optionStyle = 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5';
                    if (isCorrect) optionStyle = 'border-emerald-500/50 bg-emerald-500/10';
                    else if (isWrong) optionStyle = 'border-red-500/50 bg-red-500/10';
                    else if (isSelected) optionStyle = 'border-[var(--color-primary)] bg-[var(--color-primary)]/10';

                    return (
                        <button
                            key={opt.label}
                            onClick={() => !showAnswer && onSelect?.(opt.label)}
                            disabled={showAnswer}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${optionStyle} disabled:cursor-default`}
                        >
                            <span className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold
                ${isCorrect ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20' :
                                    isWrong ? 'border-red-500 text-red-400 bg-red-500/20' :
                                        isSelected ? 'border-[var(--color-primary)] text-[var(--color-primary-light)] bg-[var(--color-primary)]/20' :
                                            'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                            >
                                {isCorrect ? '✓' : isWrong ? '✕' : opt.label}
                            </span>
                            <span className="text-sm">{opt.text}</span>
                        </button>
                    );
                })}
            </div>

            {/* Explanation (shown in study mode or after submission) */}
            {showAnswer && question.explanation && (
                <div className="mt-4 ml-10 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs font-medium text-indigo-400 mb-1">Explanation</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{question.explanation}</p>
                </div>
            )}
        </div>
    );
}
