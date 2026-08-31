# AI Providers
`AIManager` selects a provider from `AI_PROVIDER`, defaulting to Mock. Provider-specific code must implement the common interface; application routes call the manager, not vendor SDKs directly. This preserves zero-key development and enables fallback. Production AI output must be schema-validated before being persisted as educational content.
