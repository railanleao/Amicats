package org.amicats.backend.domain.enums;

// Mirrors the documented `status_geral` column (documentos/02-Especificação do Projeto.md).
public enum CatClinicalStatus {
  InTreatment,
  AvailableForAdoption,
  InTriage,
  Adopted,
  FosterHome,
  InClinic,
  Deceased,
  Missing
}
