package com.library.service;

import com.library.dto.ApiDtos.BorrowRecordResponse;
import com.library.exception.LibraryException;
import com.library.model.*;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BorrowingService {
    private final BookRepository books;
    private final UserRepository users;
    private final BorrowRecordRepository records;

    public BorrowingService(BookRepository books, UserRepository users, BorrowRecordRepository records) {
        this.books = books;
        this.users = users;
        this.records = records;
    }

    @Transactional
    public BorrowRecordResponse borrow(Long bookId, String email) {
        Book book = books.findByIdForUpdate(bookId)
                .orElseThrow(() -> new LibraryException(HttpStatus.NOT_FOUND, "Book was not found."));
        if (book.getAvailableCopies() <= 0) {
            throw new LibraryException(HttpStatus.CONFLICT, "No copies of this book are currently available.");
        }
        AppUser user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new LibraryException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        BorrowRecord record = new BorrowRecord();
        record.setUser(user);
        record.setBook(book);
        record.setDueDate(LocalDate.now().plusDays(14));
        records.save(record);
        return BorrowRecordResponse.from(record);
    }

    @Transactional
    public BorrowRecordResponse returnBook(Long recordId, String email, boolean administrator) {
        BorrowRecord record = records.findByIdForUpdate(recordId)
                .orElseThrow(() -> new LibraryException(HttpStatus.NOT_FOUND, "Borrowing record was not found."));
        if (!administrator && !record.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new LibraryException(HttpStatus.FORBIDDEN, "You cannot return another member's book.");
        }
        if (record.getStatus() == RecordStatus.RETURNED) {
            throw new LibraryException(HttpStatus.CONFLICT, "This book has already been returned.");
        }
        Book book = books.findByIdForUpdate(record.getBook().getId())
                .orElseThrow(() -> new LibraryException(HttpStatus.NOT_FOUND, "Book was not found."));
        if (book.getAvailableCopies() >= book.getTotalCopies()) {
            throw new LibraryException(HttpStatus.CONFLICT, "Book availability is inconsistent; contact a library administrator.");
        }
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        record.setStatus(RecordStatus.RETURNED);
        record.setReturnedAt(Instant.now());
        return BorrowRecordResponse.from(record);
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> myRecords(String email) {
        return records.findByUserEmailIgnoreCaseOrderByBorrowedAtDesc(email).stream()
                .map(BorrowRecordResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> history() {
        return records.findAllByOrderByBorrowedAtDesc().stream().map(BorrowRecordResponse::from).toList();
    }
}
