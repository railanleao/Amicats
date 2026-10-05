package org.amicats.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "user_auths",
    indexes = {@Index(name = "ix_user_auth_email", columnList = "email", unique = true)})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAuth {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_user_auth")
  private Integer id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(nullable = false, unique = true, length = 150)
  private String email;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(name = "must_change_password", nullable = false)
  private boolean mustChangePassword;

  @Column(name = "password_reset_last_requested_at")
  private LocalDateTime passwordResetLastRequestedAt;

  public UserAuth(User user, String email, String passwordHash) {
    this.user = user;
    this.email = email;
    this.passwordHash = passwordHash;
    this.mustChangePassword = false;
  }

  public void changePasswordHash(String newPasswordHash) {
    this.passwordHash = newPasswordHash;
  }

  public void setMustChangePassword(boolean mustChangePassword) {
    this.mustChangePassword = mustChangePassword;
  }

  public void setPasswordResetLastRequestedAt(LocalDateTime timestamp) {
    this.passwordResetLastRequestedAt = timestamp;
  }
}
