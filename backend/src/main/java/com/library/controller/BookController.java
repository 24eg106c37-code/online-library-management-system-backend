package com.library.controller;

import com.library.dto.ApiDtos.BookRequest;
import com.library.dto.ApiDtos.BookResponse;
import com.library.service.BookService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) { this.bookService = bookService; }

    @GetMapping
    public List<BookResponse> list(@RequestParam(required = false) String query,
                                  @RequestParam(required = false) String category) {
        return bookService.list(query, category);
    }

    @GetMapping("/search")
    public List<BookResponse> search(@RequestParam(required = false) String query) {
        return bookService.list(query, null);
    }

    @GetMapping("/{id}")
    public BookResponse get(@PathVariable Long id) { return bookService.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public BookResponse create(@Valid @RequestBody BookRequest request) { return bookService.create(request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public BookResponse update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return bookService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) { bookService.delete(id); }
}
