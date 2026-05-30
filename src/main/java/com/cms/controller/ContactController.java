package com.cms.controller;

import com.cms.model.dto.ContactDTO;
import com.cms.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * ContactController handles all HTTP requests related to contacts.
 *
 * Think of this as the "front door" of the contact feature:
 * every request that comes in for /api/contacts lands here first.
 *
 * @RestController → tells Spring this class handles web requests and returns
 *                   JSON responses automatically (no need to write @ResponseBody
 *                   on every method).
 * @RequestMapping → all endpoints in this class start with /api/contacts
 * @RequiredArgsConstructor → Lombok generates a constructor that injects contactService
 * @Slf4j → Lombok gives us a `log` object to write log messages
 */
@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    // Spring automatically injects the ContactService implementation here.
    // We depend on the interface (ContactService), not the concrete class —
    // this is good practice (Dependency Inversion Principle).
    private final ContactService contactService;

    // ─── Helper: get the email of the currently logged-in user ───────────────
    //
    // Spring Security stores information about the authenticated user in a
    // "SecurityContext". After JWT authentication, the username (email) is
    // stored there. We call this at the start of every endpoint to know
    // which user is making the request.
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // =========================================================================
    // ENDPOINT 1: GET /api/contacts
    // Returns a paginated list of ALL contacts for the logged-in user.
    // =========================================================================

    /**
     * Fetch all contacts belonging to the currently authenticated user.
     * Results are paginated — use `page` and `size` query params to control output.
     *
     * Example: GET /api/contacts?page=0&size=10
     *
     * @param page which page to return (0-based, default = 0 i.e. first page)
     * @param size how many contacts per page (default = 10)
     * @return 200 OK with a Page of ContactDTOs
     */
    @GetMapping
    public ResponseEntity<Page<ContactDTO>> getAllContacts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Step 1: Get the email of the currently logged-in user from the JWT token.
        String userEmail = getCurrentUserEmail();

        // Step 2: Log that this request is being processed (useful for debugging).
        log.info("Get all contacts for: {}", userEmail);

        // Step 3: Delegate to the service layer to fetch the paginated contacts,
        // then wrap the result in a 200 OK response.
        return ResponseEntity.ok(contactService.getAllContacts(userEmail, page, size));
    }

    // =========================================================================
    // ENDPOINT 2: GET /api/contacts/search
    // Search through the logged-in user's contacts by a keyword.
    // IMPORTANT: This must be declared BEFORE /{id} so Spring doesn't mistake
    // "search" for an ID value.
    // =========================================================================

    /**
     * Search the logged-in user's contacts by a keyword.
     * Matches against first name and last name (case-insensitive).
     *
     * Example: GET /api/contacts/search?keyword=john&page=0&size=10
     *
     * @param keyword the search term to look for
     * @param page    which page to return (0-based, default = 0)
     * @param size    how many results per page (default = 10)
     * @return 200 OK with a Page of matching ContactDTOs
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ContactDTO>> searchContacts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Step 1: Identify the currently authenticated user.
        String userEmail = getCurrentUserEmail();

        // Step 2: Log the search request so we can trace it in server logs.
        log.info("Search contacts keyword: {} for: {}", keyword, userEmail);

        // Step 3: Delegate the search to the service and return results as 200 OK.
        return ResponseEntity.ok(contactService.searchContacts(userEmail, keyword, page, size));
    }

    // =========================================================================
    // ENDPOINT 3: GET /api/contacts/{id}
    // Fetch a single contact by its database ID.
    // =========================================================================

    /**
     * Retrieve one specific contact by its ID.
     * The logged-in user must own this contact — otherwise the service throws an error.
     *
     * Example: GET /api/contacts/42
     *
     * @param id the database ID of the contact (comes from the URL path)
     * @return 200 OK with the ContactDTO, or an error if not found / not owned
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContactDTO> getContactById(@PathVariable Long id) {

        // Step 1: Identify the currently authenticated user.
        String userEmail = getCurrentUserEmail();

        // Step 2: Fetch the contact from the service (ownership is checked inside).
        // Step 3: Return 200 OK with the contact data.
        return ResponseEntity.ok(contactService.getContactById(id, userEmail));
    }

    // =========================================================================
    // ENDPOINT 4: POST /api/contacts
    // Create a brand-new contact for the logged-in user.
    // =========================================================================

    /**
     * Create a new contact linked to the currently authenticated user.
     *
     * The request body must be a valid ContactDTO JSON.
     * @Valid triggers the validation annotations on ContactDTO fields
     * (e.g. @NotBlank on firstName, @Email on email addresses).
     *
     * Example: POST /api/contacts
     * Body: { "firstName": "John", "lastName": "Doe", "emails": [...] }
     *
     * @param contactDTO the contact data submitted in the request body
     * @return 201 Created with the saved ContactDTO (now includes the database-generated ID)
     */
    @PostMapping
    public ResponseEntity<ContactDTO> createContact(
            @Valid @RequestBody ContactDTO contactDTO) {

        // Step 1: Identify the currently authenticated user.
        String userEmail = getCurrentUserEmail();

        // Step 2: Log that a create operation is starting.
        log.info("Creating contact for: {}", userEmail);

        // Step 3: Delegate to the service to create and save the contact.
        ContactDTO createdContact = contactService.createContact(contactDTO, userEmail);

        // Step 4: Return 201 Created (not the usual 200 OK) because we just
        // created a new resource. Best practice for POST endpoints.
        return ResponseEntity.status(HttpStatus.CREATED).body(createdContact);
    }

    // =========================================================================
    // ENDPOINT 5: PUT /api/contacts/{id}
    // Update an existing contact's details.
    // =========================================================================

    /**
     * Update an existing contact identified by its ID.
     * The logged-in user must be the owner of this contact.
     *
     * The entire contact is replaced (full update) — send all fields in the body,
     * not just the ones you want to change.
     *
     * Example: PUT /api/contacts/42
     * Body: { "firstName": "Jane", "lastName": "Smith", "phones": [...] }
     *
     * @param id         the database ID of the contact to update (from the URL path)
     * @param contactDTO the updated contact data from the request body
     * @return 200 OK with the updated ContactDTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<ContactDTO> updateContact(
            @PathVariable Long id,
            @Valid @RequestBody ContactDTO contactDTO) {

        // Step 1: Identify the currently authenticated user.
        String userEmail = getCurrentUserEmail();

        // Step 2: Log the update request with the contact ID being updated.
        log.info("Updating contact: {} for: {}", id, userEmail);

        // Step 3: Delegate to the service (which checks ownership and applies changes).
        // Step 4: Return 200 OK with the updated contact.
        return ResponseEntity.ok(contactService.updateContact(id, contactDTO, userEmail));
    }

    // =========================================================================
    // ENDPOINT 6: DELETE /api/contacts/{id}
    // Permanently delete a contact.
    // =========================================================================

    /**
     * Delete a contact permanently by its ID.
     * The logged-in user must own the contact.
     *
     * Example: DELETE /api/contacts/42
     *
     * @param id the database ID of the contact to delete (from the URL path)
     * @return 204 No Content — successful delete with no response body
     *         (204 is the standard HTTP status for a successful DELETE)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {

        // Step 1: Identify the currently authenticated user.
        String userEmail = getCurrentUserEmail();

        // Step 2: Log the deletion request.
        log.info("Deleting contact: {} by: {}", id, userEmail);

        // Step 3: Delegate to the service to perform the deletion (checks ownership).
        contactService.deleteContact(id, userEmail);

        // Step 4: Return 204 No Content — the standard response for a successful DELETE.
        // There is no body to return because the resource no longer exists.
        return ResponseEntity.noContent().build();
    }
}
