package com.cms.unit.entity;

import com.cms.model.entity.Contact;
import com.cms.model.entity.ContactEmail;
import com.cms.model.entity.ContactPhone;
import com.cms.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Contact Entity Unit Tests")
class ContactEntityTest {

    private Contact contact;
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test@example.com")
                .passwordHash("testPassword")
                .build();

        contact = Contact.builder()
                .firstName("John")
                .lastName("Doe")
                .address("123 Main Street")
                .user(user)
                .emails(new ArrayList<>())
                .phones(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should create Contact with user association")
    void builder_associatesUser() {
        assertThat(contact.getFirstName()).isEqualTo("John");
        assertThat(contact.getUser().getFirstName()).isEqualTo("Test");
    }

    @Test
    @DisplayName("Should manage email and phone collections")
    void collections_holdChildEntities() {
        contact.getEmails().add(ContactEmail.builder()
                .email("john@company.com")
                .label("work")
                .contact(contact)
                .build());
        contact.getPhones().add(ContactPhone.builder()
                .phone("555-1234")
                .label("mobile")
                .contact(contact)
                .build());

        assertThat(contact.getEmails()).hasSize(1);
        assertThat(contact.getPhones()).hasSize(1);
    }
}
