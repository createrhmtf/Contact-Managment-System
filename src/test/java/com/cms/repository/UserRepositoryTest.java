package com.cms.repository;

import com.cms.model.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("UserRepository JPA Tests (TC-DB / TC-UNIT)")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User newSampleUser() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        return User.builder()
                .firstName("Jane")
                .lastName("Doe")
                .email("jane." + suffix + "@example.com")
                .passwordHash("hashedPassword")
                .phoneNumber("1234" + suffix)
                .build();
    }

    @Test
    @DisplayName("TC-UNIT-01: save user and findByEmail returns persisted user")
    void saveAndFindByEmail_returnsUser() {
        User sampleUser = newSampleUser();
        userRepository.save(sampleUser);

        Optional<User> found = userRepository.findByEmail(sampleUser.getEmail());

        assertThat(found).isPresent();
        assertThat(found.get().getFirstName()).isEqualTo("Jane");
        assertThat(found.get().getLastName()).isEqualTo("Doe");
    }

    @Test
    @DisplayName("TC-UNIT-02: existsByEmail returns true when email exists")
    void existsByEmail_whenPresent_returnsTrue() {
        User sampleUser = newSampleUser();
        userRepository.save(sampleUser);

        assertThat(userRepository.existsByEmail(sampleUser.getEmail())).isTrue();
    }

    @Test
    @DisplayName("TC-UNIT-02: existsByEmail returns false when email does not exist")
    void existsByEmail_whenAbsent_returnsFalse() {
        assertThat(userRepository.existsByEmail("nobody@example.com")).isFalse();
    }

    @Test
    @DisplayName("TC-UNIT-03: findByPhoneNumber returns user when phone exists")
    void findByPhoneNumber_whenPresent_returnsUser() {
        User sampleUser = newSampleUser();
        userRepository.save(sampleUser);

        Optional<User> found = userRepository.findByPhoneNumber(sampleUser.getPhoneNumber());

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo(sampleUser.getEmail());
    }

    @Test
    @DisplayName("TC-UNIT-03: existsByPhoneNumber returns true when phone exists")
    void existsByPhoneNumber_whenPresent_returnsTrue() {
        User sampleUser = newSampleUser();
        userRepository.save(sampleUser);

        assertThat(userRepository.existsByPhoneNumber(sampleUser.getPhoneNumber())).isTrue();
    }

    @Test
    @DisplayName("TC-DB-01: email column enforces uniqueness at persistence layer")
    void saveDuplicateEmail_throwsException() {
        User sampleUser = newSampleUser();
        userRepository.saveAndFlush(sampleUser);

        User duplicate = User.builder()
                .firstName("Other")
                .email(sampleUser.getEmail())
                .passwordHash("hash")
                .build();

        org.junit.jupiter.api.Assertions.assertThrows(
                DataIntegrityViolationException.class,
                () -> userRepository.saveAndFlush(duplicate));
    }

    @Test
    @DisplayName("TC-DB-02: phone column enforces uniqueness when provided")
    void saveDuplicatePhone_throwsException() {
        User sampleUser = newSampleUser();
        userRepository.saveAndFlush(sampleUser);

        User duplicate = User.builder()
                .firstName("Other")
                .email("other." + UUID.randomUUID() + "@example.com")
                .phoneNumber(sampleUser.getPhoneNumber())
                .passwordHash("hash")
                .build();

        org.junit.jupiter.api.Assertions.assertThrows(
                DataIntegrityViolationException.class,
                () -> userRepository.saveAndFlush(duplicate));
    }
}
