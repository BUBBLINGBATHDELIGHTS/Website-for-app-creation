# Decentralized Identity & Privacy Innovation

This document captures the strategic path for self-sovereign identity (SSI), privacy-preserving analytics, and continuous experimentation.

## SSI Adoption
- Implement DID issuance + verification for admin/employee roles using Supabase Edge Functions and external SSI providers.
- Store verifiable credentials (VCs) in Supabase with strict RLS, exposing only proofs required for access control.
- Update `/app/(auth)/login` to support wallet-based authentication alongside magic links.

## Privacy-preserving Analytics
- Explore homomorphic encryption or secure MPC for aggregate analytics on sensitive order and sentiment data.
- Run privacy-aware machine learning through Supabase Edge Functions, returning only anonymised insights to the UI.
- Ensure GDPR/CCPA compliance via consent tracking, right-to-be-forgotten workflows, and transparent audit logs.

## Experimentation Culture
- Schedule monthly hack sprints for AI agents, SSI proofs, and edge optimisations.
- Partner with academic labs on privacy-preserving commerce, contributing findings back to the ecosystem.
- Host quarterly “Working with Bubbles” symposiums sharing outcomes, learnings, and open research questions.
