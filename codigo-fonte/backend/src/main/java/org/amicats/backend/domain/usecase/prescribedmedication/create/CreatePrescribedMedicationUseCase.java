package org.amicats.backend.domain.usecase.prescribedmedication.create;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.Builder;
import org.amicats.backend.domain.entity.Cat;
import org.amicats.backend.domain.entity.InternalMedicalPrescription;
import org.amicats.backend.domain.entity.PrescribedMedication;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.interfaces.dataprovider.prescribedmedication.PrescribedMedicationDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockItemDataProvider;
import org.amicats.backend.domain.policy.DoseAdministrationTimePolicy;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.amicats.backend.exception.ActivePrescribedMedicationConflictException;
import org.amicats.backend.exception.InvalidPrescribedMedicationException;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class CreatePrescribedMedicationUseCase {

  private static final String MEDICATION_CATEGORY = "Medicamento";
  private static final String DEFAULT_UNIT = "unidade";
  private static final DateTimeFormatter BR_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
  private static final String MEDICATION_CREATED_WARNING =
      "%s não existia no estoque e foi cadastrado agora, com estoque zerado. Registre a compra ou"
          + " doação na tela de Estoque quando o medicamento chegar.";

  @Builder.Default private ZoneId clinicalZone = DoseAdministrationTimePolicy.DEFAULT_CLINICAL_ZONE;
  private StockItemDataProvider stockItemDataProvider;
  private PrescribedMedicationDataProvider prescribedMedicationDataProvider;

  @Transactional
  public ReadPrescribedMedicationOutput execute(
      InternalMedicalPrescription internalMedicalPrescription,
      CreatePrescribedMedicationInput input) {
    Cat cat = internalMedicalPrescription.getCat();
    LocalDateTime now = internalMedicalPrescription.getCreatedAt();
    LocalDate today = DoseAdministrationTimePolicy.clinicalDate(now, clinicalZone);

    StockItem medication = findMedication(input);
    boolean createdInStock = medication == null;

    if (createdInStock) {
      medication = createMedication(input);
    } else {
      ensureNotActive(cat, medication, today);
    }

    PrescribedMedication prescribedMedication =
        PrescribedMedication.fromInternal(
            internalMedicalPrescription,
            medication,
            input.dosage().trim(),
            input.route(),
            input.intervalHours(),
            input.durationDays(),
            today,
            now);
    prescribedMedicationDataProvider.save(prescribedMedication);

    if (createdInStock) {
      return ReadPrescribedMedicationOutput.withStockWarning(
          prescribedMedication,
          today,
          String.format(MEDICATION_CREATED_WARNING, medication.getName()));
    }
    return ReadPrescribedMedicationOutput.from(prescribedMedication, today);
  }

  private StockItem findMedication(CreatePrescribedMedicationInput input) {
    boolean hasId = input.medicationId() != null;
    boolean hasNewName = input.hasNewMedication();

    if (hasId == hasNewName) {
      throw new InvalidPrescribedMedicationException(
          "Informe o medicamento: escolha um da lista ou digite o nome de um novo.");
    }

    if (hasId) {
      StockItem item =
          stockItemDataProvider
              .findById(input.medicationId())
              .orElseThrow(() -> new ResourceNotFoundException("Medicamento não encontrado."));

      if (!normalize(item.getCategory()).equals(normalize(MEDICATION_CATEGORY))) {
        throw new InvalidPrescribedMedicationException("O item selecionado não é um medicamento.");
      }
      return item;
    }

    String key = normalize(input.newMedicationName());
    return stockItemDataProvider.findAllByCategory(MEDICATION_CATEGORY).stream()
        .filter(item -> normalize(item.getName()).equals(key))
        .findFirst()
        .orElse(null);
  }

  private StockItem createMedication(CreatePrescribedMedicationInput input) {
    String unit =
        input.newMedicationUnit() == null || input.newMedicationUnit().isBlank()
            ? DEFAULT_UNIT
            : input.newMedicationUnit().trim();

    StockItem item =
        new StockItem(
            cleanName(input.newMedicationName()),
            MEDICATION_CATEGORY,
            BigDecimal.ZERO,
            unit,
            "Cadastrado automaticamente a partir de uma prescrição médica.");

    return stockItemDataProvider.save(item);
  }

  private void ensureNotActive(Cat cat, StockItem medication, LocalDate today) {
    prescribedMedicationDataProvider
        .findActiveByCatAndMedication(cat.getId(), medication.getId(), today)
        .ifPresent(
            active -> {
              throw new ActivePrescribedMedicationConflictException(
                  String.format(
                      "%s já tem %s ativo até %s. Cancele a medicação atual antes de prescrever"
                          + " novamente.",
                      cat.getName(), medication.getName(), active.getEndDate().format(BR_DATE)));
            });
  }

  private static String cleanName(String name) {
    return name.trim().replaceAll("\\s+", " ");
  }

  private static String normalize(String value) {
    String withoutAccents =
        Normalizer.normalize(cleanName(value), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    return withoutAccents.toLowerCase(Locale.ROOT);
  }
}
