package org.amicats.backend.domain.usecase.internalmedicalprescription.create;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import org.amicats.backend.domain.usecase.prescribedmedication.create.CreatePrescribedMedicationInput;

public record CreateInternalMedicalPrescriptionInput(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 2000) String notes,
    @Valid CreatePrescribedMedicationInput medication,
    @Schema(
            description =
                "Horário do registro no dispositivo em UTC. Opcional; aceita até 30 dias no passado "
                    + "e 5 minutos no futuro.",
            example = "2026-10-08T14:00:00")
        LocalDateTime recordedAt) {

  public CreateInternalMedicalPrescriptionInput(
      String title, String notes, CreatePrescribedMedicationInput medication) {
    this(title, notes, medication, null);
  }
}
