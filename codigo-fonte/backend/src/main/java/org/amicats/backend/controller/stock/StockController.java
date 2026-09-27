package org.amicats.backend.controller.stock;

import jakarta.validation.Valid;
import org.amicats.backend.domain.usecase.common.PagedResult;
import org.amicats.backend.domain.usecase.stock.create.CreateStockItemInput;
import org.amicats.backend.domain.usecase.stock.entry.CreateStockEntryInput;
import org.amicats.backend.domain.usecase.stock.read.ReadStockItemOutput;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.amicats.backend.domain.enums.StockStatus;
import java.time.LocalDate;
import org.amicats.backend.domain.usecase.stock.update.UpdateStockItemInput;

@RequestMapping("/stock")
public interface StockController {

  @GetMapping
  PagedResult<ReadStockItemOutput> list(
    @RequestParam(required = false) String search,
    @RequestParam(required = false) String category,
    @RequestParam(required = false) StockStatus status,
    @RequestParam(required = false) LocalDate expirationFrom,
    @RequestParam(required = false) LocalDate expirationTo,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size);

  @GetMapping("/{id}")
  ReadStockItemOutput findById(@PathVariable Integer id);

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  ReadStockItemOutput create(
    @Valid @RequestBody CreateStockItemInput input);

  @PutMapping("/{id}")
  ReadStockItemOutput update(
    @PathVariable Integer id,
    @Valid @RequestBody UpdateStockItemInput input);

  @PostMapping("/entries")
  @ResponseStatus(HttpStatus.CREATED)
  void registerEntry(@Valid @RequestBody CreateStockEntryInput input);
}
