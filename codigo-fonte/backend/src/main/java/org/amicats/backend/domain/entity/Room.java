package org.amicats.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Room {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_room")
  private Integer id;

  @Column(nullable = false, length = 100)
  private String title;

  @Column(columnDefinition = "text")
  private String description;

  @Column(name = "cover_image_url", length = 500)
  private String coverImageUrl;

  @Column(name = "max_capacity")
  private Integer maxCapacity;

  @Getter(AccessLevel.NONE)
  @Column(nullable = false)
  private Boolean active;

  public Room(String title, String description, String coverImageUrl, Integer maxCapacity) {
    this.title = title;
    this.description = description;
    this.coverImageUrl = coverImageUrl;
    this.maxCapacity = maxCapacity;
    this.active = true;
  }

  public boolean isActive() {
    return active;
  }

  public void activate() {
    this.active = true;
  }

  public void deactivate() {
    this.active = false;
  }

  public void updateDetails(String title, String description, Integer maxCapacity) {
    this.title = title;
    this.description = description;
    this.maxCapacity = maxCapacity;
  }

  public void changeImage(String imageKey) {
    this.coverImageUrl = imageKey;
  }

  public void removeImage() {
    this.coverImageUrl = null;
  }
}
