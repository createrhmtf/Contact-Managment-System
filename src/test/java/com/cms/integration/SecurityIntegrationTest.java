package com.cms.integration;

import com.cms.model.dto.ChangePasswordRequest;
import com.cms.support.AbstractIntegrationTest;
import com.cms.support.AuthTestHelper;
import com.cms.support.TestConstants;
import com.cms.support.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Security Integration Tests")
class SecurityIntegrationTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("TC-SYS-02: GET / is public")
    void homeEndpoint_withoutToken_isAllowed() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-SEC-01: register and login are public")
    void authEndpoints_withoutToken_areAllowed() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestDataFactory.validRegisterRequest())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                TestDataFactory.loginWithEmail(TestConstants.USER_EMAIL))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC-SEC-02 / TC-PWD-04: change-password without token is rejected")
    void changePassword_withoutToken_isRejected() throws Exception {
        int statusCode = mockMvc.perform(put("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestDataFactory.validChangePasswordRequest())))
                .andReturn()
                .getResponse()
                .getStatus();

        org.assertj.core.api.Assertions.assertThat(statusCode).isIn(401, 403);
    }

    @Test
    @DisplayName("TC-PWD-05: change-password with invalid token is rejected")
    void changePassword_withInvalidToken_isRejected() throws Exception {
        int statusCode = mockMvc.perform(put("/api/auth/change-password")
                        .header("Authorization", "Bearer invalid.token.value")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestDataFactory.validChangePasswordRequest())))
                .andReturn()
                .getResponse()
                .getStatus();

        org.assertj.core.api.Assertions.assertThat(statusCode).isIn(401, 403);
    }

    @Test
    @DisplayName("TC-SEC-03: change-password with valid JWT returns 200")
    void changePassword_withValidToken_isAllowed() throws Exception {
        String token = AuthTestHelper.registerAndObtainToken(
                mockMvc,
                objectMapper,
                TestDataFactory.registerRequest("secured.user@test.com", "03006667788"));

        mockMvc.perform(put("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ChangePasswordRequest(TestConstants.VALID_PASSWORD, TestConstants.NEW_PASSWORD))))
                .andExpect(status().isOk());
    }
}
