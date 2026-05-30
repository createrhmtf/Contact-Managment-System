package com.cms;

import com.cms.model.entity.User;
import com.cms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("User Repository Tests")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create a test User before each test
        testUser = User.builder()
                .fullName("Test User")
                .email("testuser@example.com")
                .phoneNumber("555-0000")
                .password("testPassword123")
                .build();
    }

    @Test
    @DisplayName("Should save a User to the H2 test database")
    void testSaveUserToDatabase() {
        // Act: Save the user to the database
        User savedUser = userRepository.save(testUser);

        // Assert: Verify the user was saved with an ID
        assertNotNull(savedUser, "Saved user should not be null");
        assertNotNull(savedUser.getId(), "Saved user should have an ID");
        assertEquals("Test User", savedUser.getFullName(), "Full name should match");
        assertEquals("testuser@example.com", savedUser.getEmail(), "Email should match");
    }

    @Test
    @DisplayName("Should find a User by email address using findByEmail")
    void testFindUserByEmail() {
        // Arrange: Save a user to the database
        userRepository.save(testUser);

        // Act: Find the user by email
        Optional<User> foundUser = userRepository.findByEmail("testuser@example.com");

        // Assert: Verify the correct user was found
        assertTrue(foundUser.isPresent(), "User should be found by email");
        assertEquals("Test User", foundUser.get().getFullName(), "Found user's full name should match");
        assertEquals("testuser@example.com", foundUser.get().getEmail(), "Found user's email should match");
    }

    @Test
    @DisplayName("Should return empty Optional when email does not exist")
    void testFindUserByEmailNotFound() {
        // Arrange: Save a user with different email
        userRepository.save(testUser);

        // Act: Try to find a user with non-existent email
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");

        // Assert: Verify no user was found
        assertTrue(foundUser.isEmpty(), "Optional should be empty for non-existent email");
        assertFalse(foundUser.isPresent(), "User should not be found");
    }

    @Test
    @DisplayName("Should find a User by phone number using findByPhoneNumber")
    void testFindUserByPhoneNumber() {
        // Arrange: Save a user to the database
        userRepository.save(testUser);

        // Act: Find the user by phone number
        Optional<User> foundUser = userRepository.findByPhoneNumber("555-0000");

        // Assert: Verify the correct user was found
        assertTrue(foundUser.isPresent(), "User should be found by phone number");
        assertEquals("Test User", foundUser.get().getFullName(), "Found user's full name should match");
        assertEquals("555-0000", foundUser.get().getPhoneNumber(), "Found user's phone should match");
    }

    @Test
    @DisplayName("Should check if a User with email exists using existsByEmail")
    void testExistsByEmail() {
        // Arrange: Save a user to the database
        userRepository.save(testUser);

        // Act & Assert: Check if email exists
        assertTrue(userRepository.existsByEmail("testuser@example.com"), 
                "Email should exist in database");
        assertFalse(userRepository.existsByEmail("nonexistent@example.com"), 
                "Non-existent email should not exist in database");
    }

    @Test
    @DisplayName("Should check if a User with phone number exists using existsByPhoneNumber")
    void testExistsByPhoneNumber() {
        // Arrange: Save a user to the database
        userRepository.save(testUser);

        // Act & Assert: Check if phone exists
        assertTrue(userRepository.existsByPhoneNumber("555-0000"), 
                "Phone number should exist in database");
        assertFalse(userRepository.existsByPhoneNumber("555-9999"), 
                "Non-existent phone number should not exist in database");
    }

    @Test
    @DisplayName("Should save and retrieve a User with all fields populated")
    void testSaveAndRetrieveUserWithAllFields() {
        // Arrange: Create a complete user
        User completeUser = User.builder()
                .fullName("Complete User")
                .email("complete@example.com")
                .phoneNumber("555-1111")
                .password("securePassword")
                .build();

        // Act: Save the user
        User savedUser = userRepository.save(completeUser);

        // Act: Retrieve the user by ID
        Optional<User> retrievedUser = userRepository.findById(savedUser.getId());

        // Assert: Verify all fields were saved and retrieved correctly
        assertTrue(retrievedUser.isPresent(), "User should be found by ID");
        assertEquals("Complete User", retrievedUser.get().getFullName(), "Full name should match");
        assertEquals("complete@example.com", retrievedUser.get().getEmail(), "Email should match");
        assertEquals("555-1111", retrievedUser.get().getPhoneNumber(), "Phone should match");
        assertEquals("securePassword", retrievedUser.get().getPassword(), "Password should match");
    }

    @Test
    @DisplayName("Should handle saving multiple Users to the database")
    void testSaveMultipleUsers() {
        // Arrange: Create multiple users
        User user1 = User.builder()
                .fullName("User One")
                .email("user1@example.com")
                .phoneNumber("555-1111")
                .password("pass1")
                .build();

        User user2 = User.builder()
                .fullName("User Two")
                .email("user2@example.com")
                .phoneNumber("555-2222")
                .password("pass2")
                .build();

        // Act: Save both users
        userRepository.save(user1);
        userRepository.save(user2);

        // Assert: Verify both users can be found
        assertTrue(userRepository.existsByEmail("user1@example.com"), "User1 should exist");
        assertTrue(userRepository.existsByEmail("user2@example.com"), "User2 should exist");
        assertEquals("User One", userRepository.findByEmail("user1@example.com").get().getFullName(), 
                "User1 full name should match");
        assertEquals("User Two", userRepository.findByEmail("user2@example.com").get().getFullName(), 
                "User2 full name should match");
    }
}
