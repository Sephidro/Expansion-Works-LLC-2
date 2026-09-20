# StackBrief automation control plane

This directory contains public-safe workflow state. It contains no credentials, personal lead data, payments, private client information, or vendor secrets.

## Files

- `catalog-candidates.json`: software research and hands-on test state.
- `content-queue.json`: article and distribution work that is not yet represented by a public article record.
- `experiments.json`: hypotheses, observation windows, metrics, and decisions.
- `connections.json`: whether required external connections are ready. Values never include secrets.
- `run-ledger.json`: worker runs, their input and output IDs, and their final state.

## Worker rule

A worker reads the relevant state, advances only eligible items, records its run, and exits. A run may finish as `no_op` when no item is eligible or the evidence is insufficient.

Workers do not pass private information through this repository. Customer records, payment data, email addresses, and complete StackBrief answers belong in the future secure operations store.

## Catalog states

`discovered` → `source_verified` → `test_queued` → `tested` → `recommendation_proposed` → `approved_for_publish` → `live` → `monitored` → `retired`

## Content states

`research_ready` → `drafting` → `voice_review` → `ready_for_publish` → `published` → `distributed` → `measuring` → `archived`

An unchanged article receives at most three Voice Lab cycles. After that, the voice worker records `no_op` until the draft or real performance evidence changes.

## Approval boundaries

Low-risk content and generated metadata may publish after required checks. Pricing, offer scope, qualification, proof, privacy, recommendation outcomes, paid commitments, and affiliate relationships remain exception decisions unless the dated doctrine delegates them.
