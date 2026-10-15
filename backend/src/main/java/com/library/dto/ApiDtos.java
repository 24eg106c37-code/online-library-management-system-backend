package com.library.dto;

import com.library.model.*;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;

public final class ApiDtos {
    private ApiDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 100) String name,
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Size(min = 8, max = 72) String password) {}

    public record LoginRequest(@NotBlank @Email @Size(max = 190) String email,
                               @NotBlank @Size(max = 72) String password) {}

    public record BookRequest(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 200) String author,
            @NotBlank @Size(max = 80) String category,
            @Size(max = 30) String isbn,
            @Size(max = 5000) String description,
            @Size(max = 1000) @Pattern(regexp = "(?i)^$|^https?://[^\\s]+$", message = "must be an HTTP or HTTPS URL")
            String coverImageUrl,
            @NotNull @Min(1) @Max(100000) Integer totalCopies) {}

    public record UserResponse(Long id, String name, String email, Role role, Instant createdAt) {
        public static UserResponse from(AppUser user) {
            return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());
        }
    }

    public record AuthResponse(String token, UserResponse user) {}

    public record BookResponse(Long id, String title, String author, String category, String isbn,
            String description, String coverImageUrl, int totalCopies, int availableCopies, Instant createdAt) {
        public static BookResponse from(Book book) {
            return new BookResponse(book.getId(), book.getTitle(), book.getAuthor(), book.getCategory(),
                    book.getIsbn(), book.getDescription(), book.getCoverImageUrl(), book.getTotalCopies(),
                    book.getAvailableCopies(), book.getCreatedAt());
        }
    }

    public record BorrowRecordResponse(Long id, Long userId, String userName, String userEmail,
            Long bookId, String bookTitle, String bookAuthor, Instant borrowedAt,
            LocalDate dueDate, Instant returnedAt, RecordStatus status) {
        public static BorrowRecordResponse from(BorrowRecord record) {
            return new BorrowRecordResponse(record.getId(), record.getUser().getId(), record.getUser().getName(),
                    record.getUser().getEmail(), record.getBook().getId(), record.getBook().getTitle(),
                    record.getBook().getAuthor(), record.getBorrowedAt(), record.getDueDate(),
                    record.getReturnedAt(), record.getStatus());
        }
    }

    public record AdminStats(long totalBooks, long availableCopies, long activeLoans, long totalUsers) {}
    public record ErrorResponse(String error, String message, int status, Instant timestamp) {}
}
