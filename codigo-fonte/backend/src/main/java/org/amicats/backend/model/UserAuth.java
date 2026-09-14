package org.amicats.backend.model;

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

@Entity
@Table(name = "user_auth",
    indexes = {
        @Index(
            name = "ix_user_auth_email",
            columnList = "email",
            unique = true
        )
    }
)
public class UserAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user_auth")
    private Integer Id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true
    )
    private User user;

    @Column(
        nullable = false,
        unique = true,
        length = 150
    )
    private String Email;

    @Column(
        name = "Password_Hash",
        nullable = false,
        length = 255
    )
    private String PasswordHash;

    public Integer getId() {
        return Id;
    }

    public User getUser() {
        return user;
    }

    public String getEmail() {
        return Email;
    }

    public String getPasswordHash() {
        return PasswordHash;
    }
}
