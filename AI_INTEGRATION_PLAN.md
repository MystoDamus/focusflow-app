# FocusFlow AI Integration Plan (Optimized)

## Goals
- Use free-tier APIs (Gemini, Groq) for content generation.
- Auto-generate flashcards and quizzes from typed text and uploaded files.
- Add AI-driven study planning that connects to existing Study Methods.
- Keep latency low, reduce token usage, and preserve reliability.

## Current Implementation (Done)
- Provider abstraction: Gemini + Groq in services/aiGeneration.js.
- Flashcards: AI generation UI integrated in components/FlashcardsPage.jsx.
- Quiz: AI quiz generation + AI study plan preview integrated in components/QuizBattlePage.jsx.
- App orchestration and state wiring in App.jsx.
- Supports text and file inputs (.txt, .md, .csv, .json, .pdf).

## Optimization Roadmap

### Phase 1: Prompt and Token Efficiency
- Add concise prompt templates per task (flashcards, quiz, plan).
- Use strict JSON response schema with parser fallback.
- Apply configurable output caps (cards/questions) to control cost.
- Add dedupe + normalization pass for generated content.

### Phase 2: Workflow Integration
- Study Methods integration:
  - SQ3R: generate chapter questions from survey headings.
  - Blurting: generate reference keys + self-check checklist.
  - Interleaving: auto-suggest weighted topic rotations from weak areas.
  - Second Brain: auto-tag notes into PARA categories.
  - Code Trace: auto-generate line-by-line explanation seeds.
- Add "Use AI result" one-click insertion into each module.

### Phase 3: Reliability and Safety
- Add request timeout + retry/backoff per provider.
- Add provider failover (Gemini -> Groq text fallback).
- Add user-facing error classes (auth, quota, malformed JSON, unsupported file).
- Add optional local audit log of AI prompts/results for debugging.

### Phase 4: Performance and UX
- Add streaming UI for long generations.
- Cache recent generations per file hash and prompt hash.
- Add background generation queue for large files.
- Add progress states: reading file -> generating -> validating -> inserting.

## API Key Strategy
- Primary: environment variables:
  - VITE_GEMINI_API_KEY
  - VITE_GROQ_API_KEY
- Optional runtime override in UI input fields.
- Never hardcode keys in source.

## Suggested Next Engineering Tasks
1. Add AI outputs directly into StudyMethodsPage workflows.
2. Add server-side proxy for keys/rate-limits if moving beyond prototype.
3. Add automated tests for JSON parser and card/question normalization.
4. Add analytics: generation success rate, latency, and user acceptance rate.
