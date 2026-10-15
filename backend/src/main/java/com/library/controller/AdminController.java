package com.library.controller;

import com.library.dto.ApiDtos.AdminStats;
import com.library.dto.ApiDtos.BorrowRecordResponse;
import com.library.dto.ApiDtos.UserResponse;
import com.library.model.RecordStatus;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.UserRepository;
import com.library.service.BorrowingService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository users;
    private final BookRepository books;
    private final BorrowRecordRepository records;
    private final BorrowingService borrowingService;

    public AdminController(UserRepository users, BookRepository books,
                           BorrowRecordRepository records, BorrowingService borrowingService) {
        this.users = users;
        this.books = books;
        this.records = records;
        this.borrowingService = borrowingService;
    }

    @GetMapping("/users")
    public List<UserResponse> users() { return users.findAll().stream().map(UserResponse::from).toList(); }

    @GetMapping("/records")
    public List<BorrowRecordResponse> records() { return borrowingService.history(); }

    @GetMapping("/stats")
    public AdminStats stats() {
        long availableCopies = books.findAll().stream().mapToLong(book -> book.getAvailableCopies()).sum();
        return new AdminStats(books.count(), availableCopies, records.countByStatus(RecordStatus.BORROWED), users.count());
    }
}
