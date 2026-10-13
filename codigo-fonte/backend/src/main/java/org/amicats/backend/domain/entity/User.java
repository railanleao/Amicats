package org.amicats.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.amicats.backend.domain.enums.AccessType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "users")
@Getter
@Setter(onMethod_ = @Deprecated)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_user")
  private Integer id;

  @Column(name = "full_name", nullable = false, length = 150)
  private String fullName;

  @Column(name = "phone_number", length = 20)
  private String phoneNumber;

  @Column(name = "image_url", length = 500)
  private String imageUrl;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "access_type", nullable = false)
  private AccessType accessType;

  @Column(length = 20)
  private String crmv;

  @Column(name = "uf_crmv", length = 2)
  private String ufCrmv;

  @Column(name = "date_acceptance_terms")
  private LocalDateTime dateAcceptanceTerms;

  @Getter(AccessLevel.NONE)
  @Column(nullable = false)
  private Boolean active;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "last_login_at")
  private LocalDateTime lastLoginAt;

  public User(
      String fullName,
      String phoneNumber,
      String imageUrl,
      AccessType accessType,
      String crmv,
      String ufCrmv,
      LocalDateTime dateAcceptanceTerms) {
    this.fullName = fullName;
    this.phoneNumber = phoneNumber;
    this.imageUrl = imageUrl;
    this.accessType = accessType;
    this.crmv = crmv;
    this.ufCrmv = ufCrmv;
    this.dateAcceptanceTerms = dateAcceptanceTerms;
    this.active = true;
    this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
  }

  public boolean isActive() {
    return active;
  }

  public void deactivate() {
    this.active = false;
  }

  public void activate() {
    this.active = true;
  }

  public void changeFullName(String fullName) {
    this.fullName = fullName;
  }

  public boolean hasAcceptedTerms() {
    return dateAcceptanceTerms != null;
  }

  public void acceptTerms() {
    this.dateAcceptanceTerms = LocalDateTime.now(ZoneOffset.UTC);
  }

  public void changeImage(String imageKey) {
    this.imageUrl = imageKey;
  }

  public void removeImage() {
    this.imageUrl = null;
  }

  public void registerLogin() {
    this.lastLoginAt = LocalDateTime.now(ZoneOffset.UTC);
  }

  public void updateProfile(
      String fullName, String phoneNumber, AccessType accessType, String crmv, String ufCrmv) {
    this.fullName = fullName;
    this.phoneNumber = phoneNumber;
    this.accessType = accessType;
    this.crmv = crmv;
    this.ufCrmv = ufCrmv;
  }
}
