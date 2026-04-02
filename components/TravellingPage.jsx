/**
 * Travelling Mode - Study flashcards while exploring
 */
import { useState } from "react";

export default function TravellingPage({ currentFlashcard, onAnswer, party, mode }) {
  const [progress, setProgress] = useState(0);

  const handleAnswer = (choice) => {
    onAnswer(choice);
    setProgress((p) => Math.min(100, p + (100 / 10))); // Track 10 questions
  };

  return (
    <div className="activity-mode-page travelling-page">
      <div className="mode-header">
        <h2>🧭 Travelling</h2>
        <p>Venture through lands while studying</p>
      </div>

      <div className="travelling-scene">
        <div className="party-walking">
          <span className="traveller">🚶</span>
          <span className="traveller">⚔️</span>
          <span className="traveller">🧙</span>
          <span className="traveller">🛡️</span>
        </div>
        <div className="path-visual">PATH TO KNOWLEDGE</div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {currentFlashcard && (
        <div className="flashcard-container">
          <div className="flashcard">
            <span className="card-question">{currentFlashcard.question}</span>
          </div>
          <div className="card-choices">
            {currentFlashcard.choices?.map((choice, idx) => (
              <button key={idx} onClick={() => handleAnswer(choice)}>
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .travelling-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0d4d47 0%, #0f172a 100%);
          padding: 20px;
        }

        .mode-header {
          text-align: center;
          color: #2dd4bf;
          margin-bottom: 30px;
        }

        .mode-header h2 {
          font-size: 2rem;
          margin: 0 0 10px 0;
        }

        .travelling-scene {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: rgba(45, 212, 191, 0.1);
          border-radius: 10px;
        }

        .party-walking {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 3rem;
          animation: walk 2s ease-in-out infinite;
        }

        @keyframes walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .traveller {
          display: inline-block;
          animation: walk 2s ease-in-out infinite;
        }

        .path-visual {
          margin-top: 20px;
          color: #5eead4;
          letter-spacing: 2px;
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          overflow: hidden;
          margin: 20px 0;
          border: 1px solid #2dd4bf;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2dd4bf, #5eead4);
          transition: width 0.3s ease;
        }

        .flashcard-container {
          max-width: 500px;
          margin: 30px auto;
        }

        .flashcard {
          background: linear-gradient(135deg, #0d4d47, #1a3c3a);
          border: 2px solid #2dd4bf;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          margin-bottom: 20px;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-question {
          font-size: 1.2rem;
          color: #e0f2f1;
          font-weight: 600;
        }

        .card-choices {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card-choices button {
          padding: 12px;
          background: rgba(45, 212, 191, 0.2);
          border: 2px solid #2dd4bf;
          color: #5eead4;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .card-choices button:hover {
          background: rgba(45, 212, 191, 0.4);
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
