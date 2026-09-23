package org.amicats.backend.domain.enums;

// Shared by the cat's FIV, FeLV and PIF fields (CreateCatInput). The documented schema
// (documentos/02-Especificação do Projeto.md) models these as a single combined
// `status_saude` enum instead — that can't represent a cat testing positive for more than one
// disease at once, so this splits them into three independent results, matching the Paper
// design's "Novo gato" form. The doc is stale on this point.
public enum HealthTestResult {
  Positive,
  Negative,
  Untested
}
