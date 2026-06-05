package com.cms.integration;

import com.cms.model.dto.ContactDTO;
import com.cms.model.dto.RegisterRequest;
import com.cms.support.AbstractIntegrationTest;
import com.cms.support.AuthTestHelper;
import com.cms.support.TestConstants;
import com.cms.support.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Contact API Integration Tests")
class ContactApiIntegrationTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("TC-CON-API-01: authenticated user can create a contact with emails and phones")
    void createContact_withValidPayload_returnsCreatedContact() throws Exception {
        String token = AuthTestHelper.registerAndObtainToken(mockMvc, objectMapper);
        ContactDTO request = validContact("Maya", "Chen");

        mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.firstName").value("Maya"))
                .andExpect(jsonPath("$.emails[0].email").value("maya.chen@example.com"))
                .andExpect(jsonPath("$.emails[0].primary").value(true))
                .andExpect(jsonPath("$.phones[0].phone").value("+1 555 0101"));
    }

    @Test
    @DisplayName("TC-CON-API-02: contacts list returns only the authenticated user's contacts")
    void getAllContacts_returnsOnlyCurrentUserContacts() throws Exception {
        String firstToken = AuthTestHelper.registerAndObtainToken(
                mockMvc,
                objectMapper,
                TestDataFactory.registerRequest("first.user@test.com", "03001112222"));
        String secondToken = AuthTestHelper.registerAndObtainToken(
                mockMvc,
                objectMapper,
                TestDataFactory.registerRequest("second.user@test.com", "03003334444"));

        createContact(firstToken, validContact("Maya", "Chen"));
        createContact(secondToken, validContact("Other", "Owner"));

        mockMvc.perform(get("/api/contacts?page=0&size=8")
                        .header("Authorization", "Bearer " + firstToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].firstName").value("Maya"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("TC-CON-API-03: search filters contacts by first or last name")
    void searchContacts_filtersByName() throws Exception {
        String token = AuthTestHelper.registerAndObtainToken(mockMvc, objectMapper);
        createContact(token, validContact("Maya", "Chen"));
        createContact(token, validContact("Alex", "Morgan"));

        mockMvc.perform(get("/api/contacts/search?keyword=chen&page=0&size=8")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].firstName").value("Maya"));
    }

    @Test
    @DisplayName("TC-CON-API-04: authenticated user can update own contact")
    void updateContact_replacesEditableFields() throws Exception {
        String token = AuthTestHelper.registerAndObtainToken(mockMvc, objectMapper);
        ContactDTO created = createContact(token, validContact("Maya", "Chen"));

        ContactDTO update = validContact("Maya", "Chen");
        update.setTitle("VP Product");
        update.setCompany("Northstar Labs");
        update.setEmails(List.of(new ContactDTO.EmailDTO(null, "maya.updated@example.com", "Personal", true)));

        mockMvc.perform(put("/api/contacts/" + created.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("VP Product"))
                .andExpect(jsonPath("$.company").value("Northstar Labs"))
                .andExpect(jsonPath("$.emails[0].email").value("maya.updated@example.com"));
    }

    @Test
    @DisplayName("TC-CON-API-05: authenticated user can delete own contact")
    void deleteContact_removesContactFromDirectory() throws Exception {
        String token = AuthTestHelper.registerAndObtainToken(mockMvc, objectMapper);
        ContactDTO created = createContact(token, validContact("Maya", "Chen"));

        mockMvc.perform(delete("/api/contacts/" + created.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/contacts/" + created.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TC-CON-API-06: contact endpoints reject unauthenticated requests")
    void contactEndpoints_withoutToken_areRejected() throws Exception {
        int statusCode = mockMvc.perform(get("/api/contacts"))
                .andReturn()
                .getResponse()
                .getStatus();

        assertThat(statusCode).isIn(401, 403);
    }

    @Test
    @DisplayName("TC-CON-API-07: user cannot access another user's contact")
    void getContactById_forAnotherUsersContact_isForbidden() throws Exception {
        String ownerToken = AuthTestHelper.registerAndObtainToken(
                mockMvc,
                objectMapper,
                TestDataFactory.registerRequest("owner@test.com", "03005556666"));
        String otherToken = AuthTestHelper.registerAndObtainToken(
                mockMvc,
                objectMapper,
                TestDataFactory.registerRequest("viewer@test.com", "03007778888"));
        ContactDTO created = createContact(ownerToken, validContact("Maya", "Chen"));

        mockMvc.perform(get("/api/contacts/" + created.getId())
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You do not have permission to view this contact"));
    }

    @Test
    @DisplayName("TC-CON-API-08: missing first name returns validation error")
    void createContact_withoutFirstName_returnsValidationError() throws Exception {
        String token = AuthTestHelper.registerAndObtainToken(mockMvc, objectMapper);
        ContactDTO request = validContact("Maya", "Chen");
        request.setFirstName("");

        mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    private ContactDTO createContact(String token, ContactDTO request) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readValue(result.getResponse().getContentAsString(), ContactDTO.class);
    }

    private ContactDTO validContact(String firstName, String lastName) {
        String email = "%s.%s@example.com".formatted(firstName, lastName).toLowerCase();

        return ContactDTO.builder()
                .firstName(firstName)
                .lastName(lastName)
                .title("Product Director")
                .company("Northstar Studio")
                .address("42 Market Street")
                .notes("Met at product summit.")
                .emails(List.of(new ContactDTO.EmailDTO(null, email, "Work", true)))
                .phones(List.of(new ContactDTO.PhoneDTO(null, "+1 555 0101", "Mobile", true)))
                .build();
    }
}
