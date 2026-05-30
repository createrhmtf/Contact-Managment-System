package com.cms.unit.security;

import com.cms.security.JwtUtil;
import com.cms.support.TestConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtUtil Unit Tests (TC-JWT)")
class JwtUtilTest {

    private static final String JWT_SECRET = "TestJwtSecretKeyForUnitAndIntegrationTests123456!!";

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(JWT_SECRET, 3_600_000L);
    }

    @Nested
    @DisplayName("Token generation")
    class TokenGeneration {

        @Test
        @DisplayName("TC-JWT-01: generateToken should produce a non-blank token with email as subject")
        void generateToken_shouldContainEmailAsSubject() {
            String token = jwtUtil.generateToken(TestConstants.USER_EMAIL);

            assertThat(token).isNotBlank();
            assertThat(jwtUtil.extractUsername(token)).isEqualTo(TestConstants.USER_EMAIL);
        }
    }

    @Nested
    @DisplayName("Token validation")
    class TokenValidation {

        @Test
        @DisplayName("TC-JWT-02: validateToken returns true for matching user and valid token")
        void validateToken_withMatchingUser_returnsTrue() {
            String token = jwtUtil.generateToken(TestConstants.USER_EMAIL);
            UserDetails userDetails = User.builder()
                    .username(TestConstants.USER_EMAIL)
                    .password("ignored")
                    .roles("USER")
                    .build();

            assertThat(jwtUtil.validateToken(token, userDetails)).isTrue();
        }

        @Test
        @DisplayName("TC-JWT-03: validateToken returns false when username does not match")
        void validateToken_withDifferentUser_returnsFalse() {
            String token = jwtUtil.generateToken(TestConstants.USER_EMAIL);
            UserDetails otherUser = User.builder()
                    .username("other@test.com")
                    .password("ignored")
                    .roles("USER")
                    .build();

            assertThat(jwtUtil.validateToken(token, otherUser)).isFalse();
        }

        @Test
        @DisplayName("TC-JWT-04: isTokenExpired returns false for freshly issued token")
        void isTokenExpired_forNewToken_returnsFalse() {
            String token = jwtUtil.generateToken(TestConstants.USER_EMAIL);

            assertThat(jwtUtil.isTokenExpired(token)).isFalse();
        }
    }
}
