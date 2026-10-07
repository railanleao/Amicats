package org.amicats.backend.domain.usecase.sync.pull;

import java.time.LocalDateTime;
import java.util.List;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.domain.usecase.stock.read.ReadStockItemOutput;

public record SyncChangesOutput(
    LocalDateTime cursor,
    List<ReadCatOutput> cats,
    List<ReadRoomOutput> rooms,
    List<ReadStockItemOutput> stockItems,
    List<ReadPrescribedMedicationOutput> prescribedMedications) {}
