package org.amicats.backend.domain.usecase.sync.pull;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import lombok.Builder;
import org.amicats.backend.domain.entity.StockItem;
import org.amicats.backend.domain.enums.AccessType;
import org.amicats.backend.domain.interfaces.dataprovider.stock.StockEntryDataProvider;
import org.amicats.backend.domain.interfaces.dataprovider.sync.SyncChangesDataProvider;
import org.amicats.backend.domain.policy.DoseAdministrationTimePolicy;
import org.amicats.backend.domain.usecase.cat.read.ReadCatOutput;
import org.amicats.backend.domain.usecase.prescribedmedication.read.ReadPrescribedMedicationOutput;
import org.amicats.backend.domain.usecase.room.read.ReadRoomOutput;
import org.amicats.backend.domain.usecase.stock.read.ReadStockItemOutput;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class ReadSyncChangesUseCase {

  private static final LocalDateTime EPOCH = LocalDateTime.of(1970, 1, 1, 0, 0);
  private static final Duration CURSOR_OVERLAP = Duration.ofMinutes(1);
  private static final Set<AccessType> STOCK_READERS =
      Set.of(AccessType.Administrator, AccessType.Assistant, AccessType.Veterinarian);

  private SyncChangesDataProvider syncChangesDataProvider;
  private StockEntryDataProvider stockEntryDataProvider;
  @Builder.Default private Clock clock = Clock.systemUTC();
  @Builder.Default private ZoneId clinicalZone = DoseAdministrationTimePolicy.DEFAULT_CLINICAL_ZONE;

  @Transactional(readOnly = true)
  public SyncChangesOutput execute(LocalDateTime since, AccessType role) {
    LocalDateTime effectiveSince = since == null ? EPOCH : since;
    LocalDate today =
        DoseAdministrationTimePolicy.clinicalDate(
            DoseAdministrationTimePolicy.nowUtc(clock), clinicalZone);

    var cats = syncChangesDataProvider.findCatsUpdatedSince(effectiveSince);
    var rooms = syncChangesDataProvider.findRoomsUpdatedSince(effectiveSince);
    var stockItems =
        STOCK_READERS.contains(role)
            ? syncChangesDataProvider.findStockItemsUpdatedSince(effectiveSince)
            : List.<StockItem>of();
    var medications = syncChangesDataProvider.findPrescribedMedicationsUpdatedSince(effectiveSince);

    LocalDateTime latest =
        Stream.of(
                cats.stream().map(c -> c.getUpdatedAt()),
                rooms.stream().map(r -> r.getUpdatedAt()),
                stockItems.stream().map(s -> s.getUpdatedAt()),
                medications.stream().map(m -> m.getUpdatedAt()))
            .flatMap(stream -> stream)
            .max(LocalDateTime::compareTo)
            .orElse(null);

    return new SyncChangesOutput(
        nextCursor(since, latest),
        cats.stream().map(ReadCatOutput::from).toList(),
        rooms.stream().map(ReadRoomOutput::from).toList(),
        stockItems.stream()
            .map(
                item ->
                    ReadStockItemOutput.from(
                        item,
                        stockEntryDataProvider
                            .findNearestExpirationDate(item.getId(), today)
                            .orElse(null)))
            .toList(),
        medications.stream()
            .map(medication -> ReadPrescribedMedicationOutput.from(medication, today))
            .toList());
  }

  private LocalDateTime nextCursor(LocalDateTime since, LocalDateTime latest) {
    if (latest == null) {
      return since;
    }

    LocalDateTime candidate = latest.minus(CURSOR_OVERLAP);

    return since != null && candidate.isBefore(since) ? since : candidate;
  }
}
