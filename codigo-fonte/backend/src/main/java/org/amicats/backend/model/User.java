package org.amicats.backend.model;

import java.time.LocalDateTime;
import org.amicats.backend.model.Enum.AccessType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table(name = "User")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Integer Id;

    @Column(name = "full_name", nullable = false, length = 150)
    private String full_name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phone_number;

    @Column(name = "image_url", length = 500)
    private String image_url;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_type", nullable = false)
    private AccessType access_type;

    @Column(length = 20)
    private String crmv;

    @Column(name = "uf_crmv", length = 2)
    private String uf_crmv;

    @Column(name = "date_acceptance_terms")
    private LocalDateTime date_acceptance_terms;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime created_at;

    protected User() {}

    public User(String fullName, String email, String phoneNumber, String imageUrl,
        AccessType accessType, String crmv, String ufCrmv, LocalDateTime dateAcceptanceTerms) {
            this.full_name = fullName;
            this.email = email;
            this.phone_number = phoneNumber;
            this.image_url = imageUrl;
            this.access_type = accessType;
            this.crmv = crmv;
            this.uf_crmv = ufCrmv;
            this.date_acceptance_terms = dateAcceptanceTerms;
            this.active = true;
            this.created_at = LocalDateTime.now();
        }
    // getters
    public Integer getId() {
        return Id;
    }

    public String getFullName() {
        return full_name;
    }

    public AccessType getAccessType() {
        return access_type;
    }

    public boolean IsActive() {
        return active;
    }

    public void Deactive() {
        this.active = false;
    }

    public void ChengeFullName(String fullName) {
        this.full_name = fullName;
    }
}