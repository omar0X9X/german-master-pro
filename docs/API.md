# API
Current endpoints include `/api/ai/tutor`, `/api/ai/conversation`, `/api/ai/grammar-check`, `/api/ai/generate-lesson`, `/api/ai/evaluate-writing`, `/api/ai/explain-concept`, `/api/ai/translate`, `/api/unlock/check`, `/api/progress`, and `/api/status`. All production write endpoints should validate with Zod, authenticate with Supabase and apply rate limiting before persistence.
