package com.cms.integration;

import com.cms.model.dto.UserDTO;
import com.cms.support.AbstractIntegrationTest;
import com.cms.support.AuthTestHelper;
import com.cms.support.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("User Profile API Integration Tests")
class UserProfileApiIntegrationTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("TC-PROFILE-API-01: authenticated user can fetch own profile")
    void getMyProfile_withToken_returnsCurrentUser() throws Exception {
        String token = AuthTestHelper.registerAndObtainToken(
                mockMvc,
                objectMapper,
                TestDataFactory.registerRequest("profile.user@test.com", "03009990000"));

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("profile.user@test.com"))
                .andExpect(jsonPath("$.firstName").value("Ali"))
                .andExpect(jsonPath("$.phoneNumber").value("03009990000"));
    }

    @Test
    @DisplayName("TC-PROFILE-API-02: authenticated user can update first and last name")
    void updateMyProfile_withToken_persistsNames() throws Exception {
        String token = AuthTestHelper.registerAndObtainToken(
                mockMvc,
                objectMapper,
                TestDataFactory.registerRequest("profile.update@test.com", "03008881111"));

        UserDTO request = UserDTO.builder()
                .firstName("Alina")
                .lastName("Morgan")
                .build();

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alina"))
                .andExpect(jsonPath("$.lastName").value("Morgan"))
                .andExpect(jsonPath("$.email").value("profile.update@test.com"));
    }

    @Test
    @DisplayName("TC-PROFILE-API-03: profile endpoints reject unauthenticated requests")
    void profileEndpoints_withoutToken_areRejected() throws Exception {
        int statusCode = mockMvc.perform(get("/api/users/me"))
                .andReturn()
                .getResponse()
                .getStatus();

        assertThat(statusCode).isIn(401, 403);
    }
}
