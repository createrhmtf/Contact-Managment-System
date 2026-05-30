package com.cms.unit.entity;

import com.cms.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("User Entity Unit Tests")
class UserEntityTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
    }

    @Test
    @DisplayName("Should create a User with builder and set all fields correctly")
    void builder_setsAllFields() {
        User newUser = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .phoneNumber("1234567890")
                .passwordHash("securePassword123")
                .build();

        assertThat(newUser.getFirstName()).isEqualTo("John");
        assertThat(newUser.getLastName()).isEqualTo("Doe");
        assertThat(newUser.getEmail()).isEqualTo("john@example.com");
        assertThat(newUser.getPhoneNumber()).isEqualTo("1234567890");
        assertThat(newUser.getPasswordHash()).isEqualTo("securePassword123");
    }

    @Test
    @DisplayName("Should set and retrieve fields using setters and getters")
    void settersAndGetters_workCorrectly() {
        user.setFirstName("Alice");
        user.setLastName("Johnson");
        user.setEmail("alice@example.com");
        user.setPhoneNumber("9876543210");
        user.setPasswordHash("myPassword456");

        assertThat(user.getFirstName()).isEqualTo("Alice");
        assertThat(user.getEmail()).isEqualTo("alice@example.com");
    }
}
