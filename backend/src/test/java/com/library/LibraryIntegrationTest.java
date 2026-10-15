package com.library;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.model.AppUser;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.UserRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:library-test;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=test-only-signing-secret-which-is-long-enough",
        "app.admin.email=admin@example.test",
        "app.admin.password=training-admin-password"
})
@AutoConfigureMockMvc
class LibraryIntegrationTest {
    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private BookRepository books;
    @Autowired private BorrowRecordRepository records;
    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void clearLibrary() {
        records.deleteAll();
        books.deleteAll();
    }

    @Test
    void registrationLoginAndMeReturnSafeUserDetails() throws Exception {
        String email = email();
        String registration = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"name\":\"Reader One\",\"email\":\"" + email + "\",\"password\":\"reader-password-1\",\"role\":\"ADMIN\"}")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role").value("USER"))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(registration).path("token").asText();
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.password").doesNotExist());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"email\":\"" + email + "\",\"password\":\"reader-password-1\"}")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"name\":\"Reader Two\",\"email\":\"" + email + "\",\"password\":\"reader-password-1\"}")))
                .andExpect(status().isConflict());
    }

    @Test
    void bookCrudIsPublicForReadingAndRestrictedToAdministratorsForChanges() throws Exception {
        String userToken = registerAndGetToken(email());
        mvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/books").header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON).content(bookJson("Unauthorized book", 1, "111")))
                .andExpect(status().isForbidden());

        String adminToken = adminToken();
        String created = mvc.perform(post("/api/books").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(bookJson("Training title", 2, "222")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.availableCopies").value(2))
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(created).path("id").asLong();
        mvc.perform(get("/api/books/" + id)).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Training title"));
        mvc.perform(put("/api/books/" + id).header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(bookJson("Updated title", 3, "222")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.availableCopies").value(3));
        mvc.perform(delete("/api/books/" + id).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void borrowingEnforcesAvailabilityAndReturnsOnlyOnce() throws Exception {
        String adminToken = adminToken();
        long bookId = createBook(adminToken, "One copy only", 1, "333");
        mvc.perform(get("/api/borrowing/my-records")).andExpect(status().isUnauthorized());
        String memberToken = registerAndGetToken(email());
        String recordResponse = mvc.perform(post("/api/borrowing/borrow/" + bookId)
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("BORROWED"))
                .andReturn().getResponse().getContentAsString();
        long recordId = objectMapper.readTree(recordResponse).path("id").asLong();
        mvc.perform(post("/api/borrowing/borrow/" + bookId).header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/borrowing/my-records").header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].bookTitle").value("One copy only"));
        mvc.perform(post("/api/borrowing/return/" + recordId).header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("RETURNED"));
        mvc.perform(post("/api/borrowing/return/" + recordId).header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/books/" + bookId)).andExpect(jsonPath("$.availableCopies").value(1));
        mvc.perform(get("/api/borrowing/history").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].status").value("RETURNED"));
    }

    @Test
    void validatesCopyCountsAndUniqueIsbn() throws Exception {
        String adminToken = adminToken();
        mvc.perform(post("/api/books").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(bookJson("Bad quantity", 0, "444")))
                .andExpect(status().isBadRequest());
        createBook(adminToken, "Unique ISBN", 1, "555");
        mvc.perform(post("/api/books").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(bookJson("Duplicate ISBN", 1, "555")))
                .andExpect(status().isConflict());
        AppUser administrator = users.findByEmailIgnoreCase("admin@example.test").orElseThrow();
        org.junit.jupiter.api.Assertions.assertTrue(passwordEncoder.matches("training-admin-password", administrator.getPassword()));
    }

    private long createBook(String token, String title, int copies, String isbn) throws Exception {
        String response = mvc.perform(post("/api/books").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(bookJson(title, copies, isbn)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("id").asLong();
    }

    private String registerAndGetToken(String email) throws Exception {
        String result = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"name\":\"Training Reader\",\"email\":\"" + email + "\",\"password\":\"reader-password-1\"}")))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode response = objectMapper.readTree(result);
        return response.path("token").asText();
    }

    private String adminToken() throws Exception {
        String result = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("{\"email\":\"admin@example.test\",\"password\":\"training-admin-password\"}")))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(result).path("token").asText();
    }

    private String bookJson(String title, int copies, String isbn) {
        return json("{\"title\":\"" + title + "\",\"author\":\"A. Author\",\"category\":\"Fiction\","
                + "\"isbn\":\"" + isbn + "\",\"description\":\"A training book\","
                + "\"coverImageUrl\":\"\",\"totalCopies\":" + copies + "}");
    }

    private String email() { return "reader-" + UUID.randomUUID() + "@example.test"; }
    private String json(String value) { return value; }
}
