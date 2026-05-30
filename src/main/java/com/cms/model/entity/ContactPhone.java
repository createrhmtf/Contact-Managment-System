package com.cms.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contact_phones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactPhone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;
    private String label;  // e.g. "mobile", "home"

    @ManyToOne
    @JoinColumn(name = "contact_id")
    private Contact contact;
}