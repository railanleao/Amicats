package org.amicats.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cat_photos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CatPhoto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cat_photo")
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cat_id", nullable = false)
  private Cat cat;

  @Column(name = "storage_key", nullable = false, length = 255)
  private String storageKey;

  @Column(nullable = false)
  private Integer position;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  public CatPhoto(Cat cat, String storageKey, Integer position) {
    this.cat = cat;
    this.storageKey = storageKey;
    this.position = position;
    this.createdAt = LocalDateTime.now();
  }
}
