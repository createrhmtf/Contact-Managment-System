package com.cms.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contact_emails")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactEmail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    private String email;

    private String label;  // e.g. "work", "personal"

    @ManyToOne
    @JoinColumn(name = "contact_id")
    private Contact contact;
}