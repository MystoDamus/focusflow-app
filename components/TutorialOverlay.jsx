import { useEffect, useMemo, useState } from "react";

const GUIDE_AVATAR = "🧙";

export default function TutorialOverlay({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState(null);

  const steps = useMemo(() => ([
    {
      id: "welcome",
      title: "Welcome to your study command center",
      content: "I will point to each part of your workspace so you can learn by seeing it directly.",
      target: null,
    },
    {
      id: "sidebar",
      title: "Navigation and space control",
      content: "Use this button to collapse the sidebar and make room for focused work.",
      target: '[data-tutorial="sidebar-toggle"]',
    },
    {
      id: "toolbar",
      title: "Quick workspace controls",
      content: "Theme, sync status, and session controls are all in one compact toolbar.",
      target: '[data-tutorial="toolbar"]',
    },
    {
      id: "quests",
      title: "Your daily quest board",
      content: "This is your main to-do lane. Complete quests here to move your progress forward.",
      target: '[data-tutorial="quest-board"]',
    },
    {
      id: "focus",
      title: "Focus and timing panel",
      content: "Focus Ritual is integrated here through the timer flow instead of being a separate page.",
      target: '[data-tutorial="focus-panel"]',
    },
    {
      id: "studyhub",
      title: "Integrated study hub",
      content: "Leaderboard, calendar, and notes now live on your dashboard for less context switching.",
      target: '[data-tutorial="study-hub"]',
    },
    {
      id: "actions",
      title: "Core actions only",
      content: "Use these core actions for day-to-day flow: Planner, Flashcards, and Quiz Battle.",
      target: '[data-tutorial="quick-actions"]',
    },
    {
      id: "ready",
      title: "You are ready",
      content: "You now have a cleaner workflow: fewer separate pages, more usable dashboard space, and guided progression.",
      target: null,
    },
  ]), []);

  useEffect(() => {
    const step = steps[currentStep];
    if (!step?.target) {
      setHighlightRect(null);
      return;
    }

    const node = document.querySelector(step.target);
    if (!node) {
      setHighlightRect(null);
      return;
    }

    const updateRect = () => {
      const rect = node.getBoundingClientRect();
      setHighlightRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [currentStep, steps]);

  const step = steps[currentStep];

  function next() {
    if (currentStep >= steps.length - 1) {
      onComplete();
      return;
    }
    setCurrentStep((value) => value + 1);
  }

  function prev() {
    setCurrentStep((value) => Math.max(0, value - 1));
  }

  const tooltipStyle = highlightRect
    ? {
        top: Math.max(24, highlightRect.top + highlightRect.height + 14),
        left: Math.max(16, Math.min(window.innerWidth - 380, highlightRect.left)),
      }
    : {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Guided tutorial">
      <div className="tutorial-backdrop" onClick={() => {}} />

      {highlightRect ? (
        <div
          className="tutorial-highlight"
          style={{
            top: highlightRect.top - 6,
            left: highlightRect.left - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
          }}
        />
      ) : null}

      {highlightRect ? (
        <div
          className="tutorial-avatar-pointer"
          style={{
            top: Math.max(18, highlightRect.top - 52),
            left: highlightRect.left + Math.min(highlightRect.width - 26, 24),
          }}
          aria-hidden
        >
          {GUIDE_AVATAR}
        </div>
      ) : null}

      <div className="tutorial-card" style={tooltipStyle}>
        <button type="button" className="tutorial-close" onClick={onSkip} aria-label="Skip tutorial">✕</button>
        <div className="tutorial-step-top">
          <span className="tutorial-avatar">{GUIDE_AVATAR}</span>
          <div>
            <p className="tutorial-kicker">Guided Tour</p>
            <h3>{step.title}</h3>
          </div>
        </div>
        <p className="tutorial-copy">{step.content}</p>

        <div className="tutorial-progress">
          <span>{currentStep + 1} / {steps.length}</span>
          <div className="tutorial-dots">
            {steps.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`tutorial-dot ${index === currentStep ? "is-active" : ""}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="tutorial-actions">
          <button type="button" className="ghost-button" onClick={prev} disabled={currentStep === 0}>Back</button>
          <button type="button" className="ghost-button" onClick={onSkip}>Skip</button>
          <button type="button" className="accent-button" onClick={next}>
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
