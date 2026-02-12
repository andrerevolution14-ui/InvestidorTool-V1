"use client";

interface Option {
    value: string;
    label: string;
    sublabel?: string;
}

interface StepCardProps {
    stepNumber: number;
    totalSteps: number;
    question: string;
    options: Option[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

export default function StepCard({
    stepNumber,
    totalSteps,
    question,
    options,
    selectedValue,
    onSelect,
}: StepCardProps) {
    return (
        <div className="step-container">
            <div className="step-header animate-fade-in-up">
                <div className="step-counter">
                    <span className="step-number">
                        Passo {stepNumber} de {totalSteps}
                    </span>
                </div>
                <h2 className="step-question">{question}</h2>
            </div>

            <div className="step-content">
                <div className="options-grid stagger-children">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`option-card ${selectedValue === option.value ? "selected" : ""
                                }`}
                            onClick={() => onSelect(option.value)}
                            id={`option-${option.value}`}
                        >
                            <span className="option-indicator" />
                            <div>
                                <span className="option-label">{option.label}</span>
                                {option.sublabel && (
                                    <p className="option-sublabel">{option.sublabel}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
