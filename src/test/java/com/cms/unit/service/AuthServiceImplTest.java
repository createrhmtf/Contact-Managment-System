package com.cms.unit.service;

import com.cms.model.dto.AuthResponse;
import com.cms.model.dto.LoginRequest;
import com.cms.model.dto.RegisterRequest;
import com.cms.model.entity.User;
import com.cms.repository.UserRepository;
import com.cms.security.JwtUtil;
import com.cms.service.impl.AuthServiceImpl;
import com.cms.support.TestConstants;
import com.cms.support.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthServiceImpl Unit Tests")
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("TC-REG-01: should save user with encoded password and return JWT response")
        void register_withValidRequest_returnsAuthResponse() {
            RegisterRequest request = TestDataFactory.validRegisterRequest();

            when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
            when(userRepository.existsByPhoneNumber(request.getPhoneNumber())).thenReturn(false);
            when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded-hash");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                user.setId(1L);
                return user;
            });
            when(jwtUtil.generateToken(request.getEmail())).thenReturn("jwt-token");

            AuthResponse response = authService.register(request);

            assertThat(response.getToken()).isEqualTo("jwt-token");
            assertThat(response.getEmail()).isEqualTo(request.getEmail());
            assertThat(response.getFirstName()).isEqualTo(request.getFirstName());

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("encoded-hash");
        }

        @Test
        @DisplayName("TC-REG-04: should throw when email already exists")
        void register_withDuplicateEmail_throwsIllegalArgumentException() {
            RegisterRequest request = TestDataFactory.validRegisterRequest();
            when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Email already registered");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-REG-05: should throw when phone already exists")
        void register_withDuplicatePhone_throwsIllegalArgumentException() {
            RegisterRequest request = TestDataFactory.validRegisterRequest();
            when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
            when(userRepository.existsByPhoneNumber(request.getPhoneNumber())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Phone already registered");
        }
    }

    @Nested
    @DisplayName("login()")
    class Login {

        @Test
        @DisplayName("TC-LOG-01: should return token when email and password match")
        void login_withValidEmail_returnsAuthResponse() {
            LoginRequest request = TestDataFactory.loginWithEmail(TestConstants.USER_EMAIL);
            User user = TestDataFactory.persistedUser(TestConstants.USER_EMAIL, "encoded-hash");

            when(userRepository.findByEmail(TestConstants.USER_EMAIL)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(TestConstants.VALID_PASSWORD, "encoded-hash")).thenReturn(true);
            when(jwtUtil.generateToken(TestConstants.USER_EMAIL)).thenReturn("jwt-token");

            AuthResponse response = authService.login(request);

            assertThat(response.getToken()).isEqualTo("jwt-token");
            assertThat(response.getEmail()).isEqualTo(TestConstants.USER_EMAIL);
        }

        @Test
        @DisplayName("TC-LOG-02: should resolve user by phone number")
        void login_withValidPhone_returnsAuthResponse() {
            LoginRequest request = TestDataFactory.loginWithPhone(TestConstants.USER_PHONE);
            User user = TestDataFactory.persistedUser(TestConstants.USER_EMAIL, "encoded-hash");

            when(userRepository.findByEmail(TestConstants.USER_PHONE)).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber(TestConstants.USER_PHONE)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(TestConstants.VALID_PASSWORD, "encoded-hash")).thenReturn(true);
            when(jwtUtil.generateToken(TestConstants.USER_EMAIL)).thenReturn("jwt-token");

            AuthResponse response = authService.login(request);

            assertThat(response.getToken()).isEqualTo("jwt-token");
        }

        @Test
        @DisplayName("TC-LOG-03: should throw when password is wrong")
        void login_withWrongPassword_throwsIllegalArgumentException() {
            LoginRequest request = TestDataFactory.loginWithEmail(TestConstants.USER_EMAIL);
            User user = TestDataFactory.persistedUser(TestConstants.USER_EMAIL, "encoded-hash");

            when(userRepository.findByEmail(TestConstants.USER_EMAIL)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Invalid password");
        }

        @Test
        @DisplayName("TC-LOG-04: should throw when user is not found")
        void login_withUnknownIdentifier_throwsIllegalArgumentException() {
            LoginRequest request = new LoginRequest("unknown@test.com", TestConstants.VALID_PASSWORD);

            when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());
            when(userRepository.findByPhoneNumber("unknown@test.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("User not found");
        }
    }

    @Nested
    @DisplayName("changePassword()")
    class ChangePassword {

        @Test
        @DisplayName("TC-PWD-01: should update password when current password is correct")
        void changePassword_withValidCurrentPassword_updatesHash() {
            User user = TestDataFactory.persistedUser(TestConstants.USER_EMAIL, "old-hash");

            when(userRepository.findByEmail(TestConstants.USER_EMAIL)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(TestConstants.VALID_PASSWORD, "old-hash")).thenReturn(true);
            when(passwordEncoder.encode(TestConstants.NEW_PASSWORD)).thenReturn("new-hash");

            authService.changePassword(
                    TestConstants.USER_EMAIL,
                    TestConstants.VALID_PASSWORD,
                    TestConstants.NEW_PASSWORD);

            assertThat(user.getPasswordHash()).isEqualTo("new-hash");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("TC-PWD-02: should throw when current password is wrong")
        void changePassword_withWrongCurrentPassword_throwsIllegalArgumentException() {
            User user = TestDataFactory.persistedUser(TestConstants.USER_EMAIL, "old-hash");

            when(userRepository.findByEmail(TestConstants.USER_EMAIL)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(TestConstants.VALID_PASSWORD, "old-hash")).thenReturn(false);

            assertThatThrownBy(() -> authService.changePassword(
                            TestConstants.USER_EMAIL,
                            TestConstants.VALID_PASSWORD,
                            TestConstants.NEW_PASSWORD))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Current password is wrong");

            verify(userRepository, never()).save(any());
        }
    }
}
