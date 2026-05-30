package com.cms.controller;

import com.cms.exception.GlobalExceptionHandler;
import com.cms.model.dto.AuthResponse;
import com.cms.model.dto.ChangePasswordRequest;
import com.cms.model.dto.LoginRequest;
import com.cms.model.dto.RegisterRequest;
import com.cms.security.JwtFilter;
import com.cms.security.JwtUtil;
import com.cms.security.UserDetailsServiceImpl;
import com.cms.service.AuthService;
import com.cms.support.TestConstants;
import com.cms.support.TestDataFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("AuthController Web Layer Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterEndpoint {

        @Test
        @DisplayName("TC-REG-01: returns 201 and auth payload when service succeeds")
        void register_returnsCreated() throws Exception {
            RegisterRequest request = TestDataFactory.validRegisterRequest();
            AuthResponse response = AuthResponse.builder()
                    .token("jwt-token")
                    .firstName(request.getFirstName())
                    .email(request.getEmail())
                    .build();

            when(authService.register(any(RegisterRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.token").value("jwt-token"))
                    .andExpect(jsonPath("$.email").value(request.getEmail()))
                    .andExpect(jsonPath("$.firstName").value(request.getFirstName()));
        }

        @Test
        @DisplayName("TC-REG-08: returns 400 when validation fails")
        void register_withInvalidBody_returnsBadRequest() throws Exception {
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors").isArray());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginEndpoint {

        @Test
        @DisplayName("TC-LOG-01: returns 200 and auth payload when service succeeds")
        void login_returnsOk() throws Exception {
            LoginRequest request = TestDataFactory.loginWithEmail(TestConstants.USER_EMAIL);
            AuthResponse response = AuthResponse.builder()
                    .token("jwt-token")
                    .firstName(TestConstants.USER_FIRST_NAME)
                    .email(TestConstants.USER_EMAIL)
                    .build();

            when(authService.login(any(LoginRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value("jwt-token"));
        }
    }

    @Nested
    @DisplayName("PUT /api/auth/change-password")
    class ChangePasswordEndpoint {

        @Test
        @WithMockUser(username = TestConstants.USER_EMAIL)
        @DisplayName("TC-PWD-01: returns 200 when authenticated user changes password")
        void changePassword_returnsOk() throws Exception {
            ChangePasswordRequest request = TestDataFactory.validChangePasswordRequest();
            doNothing().when(authService).changePassword(
                    eq(TestConstants.USER_EMAIL),
                    eq(TestConstants.VALID_PASSWORD),
                    eq(TestConstants.NEW_PASSWORD));

            mockMvc.perform(put("/api/auth/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value("Password changed successfully"));

            verify(authService).changePassword(
                    TestConstants.USER_EMAIL,
                    TestConstants.VALID_PASSWORD,
                    TestConstants.NEW_PASSWORD);
        }

        @Test
        @WithMockUser(username = TestConstants.USER_EMAIL)
        @DisplayName("TC-PWD-03: returns 400 when new password is too short")
        void changePassword_withShortNewPassword_returnsBadRequest() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest(
                    TestConstants.VALID_PASSWORD,
                    TestConstants.SHORT_PASSWORD);

            mockMvc.perform(put("/api/auth/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors").isArray());
        }
    }
}
