package com.library.controller;

import com.library.dto.ApiDtos.BorrowRecordResponse;
import com.library.service.BorrowingService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/borrowing")
public class BorrowingController {
    private final BorrowingService borrowingService;

    public BorrowingController(BorrowingService borrowingService) { this.borrowingService = borrowingService; }

    @PostMapping("/borrow/{bookId}")
    public BorrowRecordResponse borrow(@PathVariable Long bookId, Authentication authentication) {
        return borrowingService.borrow(bookId, authentication.getName());
    }

    @PostMapping("/return/{recordId}")
    public BorrowRecordResponse returnBook(@PathVariable Long recordId, Authentication authentication) {
        boolean administrator = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        return borrowingService.returnBook(recordId, authentication.getName(), administrator);
    }

    @GetMapping("/my-records")
    public List<BorrowRecordResponse> myRecords(Authentication authentication) {
        return borrowingService.myRecords(authentication.getName());
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BorrowRecordResponse> history() { return borrowingService.history(); }
}
