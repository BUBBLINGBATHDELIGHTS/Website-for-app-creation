# Decentralized identity & privacy innovation roadmap

This document captures the strategy for introducing self-sovereign identity (SSI), privacy-preserving analytics, and a continuous experimentation culture to Bubbling Bath Delights. It extends the main modernization roadmap with concrete deliverables that help the platform respect shopper privacy while enabling advanced AI-driven experiences.

---

## 1. Self-sovereign identity architecture

### Goals
- Give every shopper, employee, and partner a portable, verifiable credential they can present selectively.
- Reduce dependence on centralized password stores by adopting Decentralized Identifiers (DIDs) and verifiable credentials (VCs).
- Preserve seamless UX on the storefront, admin, and employee portals while unlocking cross-platform authentication.

### Recommended components
| Capability | Recommendation | Notes |
| ---------- | -------------- | ----- |
| DID method | `did:key` for rapid prototyping, graduating to `did:web` or ledger-backed `did:ion` for production | `did:key` keeps onboarding trivial; migration path documented below. |
| Wallet & agent | Integrate the [Self-Issued OpenID Provider (SIOP) v2](https://openid.net/specs/openid-connect-self-issued-v2-1_0.html) flow via libraries like [Auth0's DID Auth JS](https://github.com/auth0/did-auth-jose) or [SpruceID DIDKit](https://github.com/spruceid/didkit) | Allows mobile wallets (Bloom, Trinsic, Connect.Me) to present credentials. |
| Credential schema registry | Use Supabase to host JSON-LD credential schemas while mirroring them to a public registry (e.g., [W3C Credentials Community Group](https://www.w3.org/community/credentials/)) | Ensures compatibility with wallet vendors. |
| Issuer & verifier services | Extend the `server/` workspace with an `ssi` module that uses [Veramo](https://veramo.io/) for issuing VCs and [DIDKit](https://docs.spruceid.com/didkit/) for verification | Turborepo pipeline can generate shared TypeScript types for credential payloads. |
| Credential storage | Store only hashed/rotated credential IDs and presentation audit logs in Postgres. Never persist raw credential payloads. | Aligns with GDPR data-minimization requirements. |

### Implementation phases
1. **Discovery & prototype (2 sprints)**
   - Add an opt-in DID login button to `/login` that spins up a SIOP v2 request.
   - Issue temporary loyalty credentials signed with `did:key` from the backend.
   - Gate the admin and employee portals behind DID-presented workspace credentials.
2. **Production hardening (4 sprints)**
   - Migrate to long-lived identifiers (e.g., `did:web:bubblingbathdelights.com`).
   - Register credential schemas, implement revocation lists, and automate key rotation.
   - Add audit logging (`ssi_audit_events` table) with encryption-at-rest.
3. **Partner ecosystem (ongoing)**
   - Allow spa partners to issue/verify service credentials through delegated keys.
   - Support multi-tenant credential templates so franchise locations can manage their staff identities.

---

## 2. Privacy-preserving analytics & AI

### Homomorphic encryption & SMPC
- Evaluate SaaS offerings such as [Zama Concrete](https://www.zama.ai/concrete) for TFHE-based homomorphic encryption that works with TypeScript bindings.
- Prototype secure aggregation with [OpenMined PySyft](https://github.com/OpenMined/PySyft) for multi-party order analytics. Start with the AI microservice (`ai-service/`) consuming encrypted summaries instead of raw events.
- Implement a privacy budget tracker (differential privacy) for recurring analytics jobs.

### Data pipeline blueprint
1. **Collection** – Instrument the storefront with OpenTelemetry events, immediately pseudonymise session IDs, and push them to a Kafka topic (e.g., Redpanda Cloud) with envelope encryption.
2. **Processing** – Supabase Edge Functions decrypt only the fields required for fraud detection while leaving other aggregates encrypted.
3. **AI insights** – The FastAPI AI service requests decrypted slices through a consent API that validates the shopper’s granted permissions stored in the SSI wallet.
4. **Storage** – Persist aggregates in a dedicated `privacy_analytics` schema with column-level encryption (pgcrypto) and strict RLS policies.

### Compliance checkpoints
- **GDPR** – Document lawful bases for data processing and add self-service data export/delete endpoints linked to DID-authenticated requests.
- **CCPA** – Provide "Do Not Sell" toggles stored as verifiable consent credentials.
- **Audit** – Schedule quarterly privacy impact assessments (PIAs) and log results in the engineering wiki.

---

## 3. Continuous innovation culture

### Internal programs
- **Quarterly hack weeks** focused on SSI, privacy tech, or AI-driven UX, with demo day judging and prize pools.
- **Innovation backlog** tracked in Jira/Linear where engineers and product can pitch experiments; allocate at least 15% of engineering capacity to exploration.
- **Pairings with AI** – Encourage teams to log learnings from the admin AI workbench, refining prompts and automation scripts that improve deployment velocity.

### External collaborations
- Partner with nearby universities’ HCI and cryptography labs to co-author papers on emotionally adaptive commerce.
- Sponsor workshops at industry conferences (e.g., Decentralized Identity Foundation, Privacy Enhancing Technology Symposium) and open-source relevant tooling developed in-house (anonymised, security-reviewed).
- Offer paid internships and fellowships for researchers exploring DID wallets, privacy-preserving recommendation engines, or AI governance.

### Experimentation safeguards
- Maintain a feature flag framework (e.g., LaunchDarkly or Supabase Feature Flags) so experiments can be turned on/off without redeploys.
- Extend the observability stack with experiment metadata (flag name, cohort) to correlate with conversion, retention, and sentiment metrics.
- Require security/privacy sign-off for experiments that touch PII or wallet data, ensuring zero-trust principles remain intact.

---

## 4. Next actions snapshot

| Timeline | Owner | Action |
| -------- | ----- | ------ |
| Week 1   | Platform lead | Stand up Veramo-based issuer/verifier prototype inside the server workspace. |
| Week 2   | Frontend lead | Ship DID login CTA behind a feature flag and capture UX feedback. |
| Week 3   | Data team | Evaluate homomorphic encryption SDKs; build spike comparing compute costs. |
| Week 4   | Leadership | Publish innovation charter and schedule the first hack week. |
| Week 6   | Compliance | Draft GDPR/CCPA addendum covering SSI data processing flows. |

Document progress in the engineering wiki and update this roadmap monthly so stakeholders can track SSI adoption, privacy investments, and experimentation outcomes.
