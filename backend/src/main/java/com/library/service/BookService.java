package com.library.service;

import com.library.dto.ApiDtos.BookRequest;
import com.library.dto.ApiDtos.BookResponse;
import com.library.exception.LibraryException;
import com.library.model.Book;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookService {
    private final BookRepository books;
    private final BorrowRecordRepository records;

    public BookService(BookRepository books, BorrowRecordRepository records) {
        this.books = books;
        this.records = records;
    }

    @Transactional(readOnly = true)
    public List<BookResponse> list(String query, String category) {
        return books.search(cleanFilter(query), cleanFilter(category)).stream().map(BookResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BookResponse get(Long id) {
        return BookResponse.from(find(id));
    }

    @Transactional
    public BookResponse create(BookRequest request) {
        Book book = new Book();
        apply(book, request);
        book.setAvailableCopies(request.totalCopies());
        return save(book);
    }

    @Transactional
    public BookResponse update(Long id, BookRequest request) {
        Book book = books.findByIdForUpdate(id).orElseThrow(() -> notFound("Book"));
        int activeLoans = book.getTotalCopies() - book.getAvailableCopies();
        if (request.totalCopies() < activeLoans) {
            throw new LibraryException(HttpStatus.CONFLICT, "Total copies cannot be less than the number currently borrowed.");
        }
        apply(book, request);
        book.setAvailableCopies(request.totalCopies() - activeLoans);
        return save(book);
    }

    @Transactional
    public void delete(Long id) {
        Book book = books.findByIdForUpdate(id).orElseThrow(() -> notFound("Book"));
        if (records.existsByBookId(id)) {
            throw new LibraryException(HttpStatus.CONFLICT, "This book has borrowing history and cannot be deleted.");
        }
        books.delete(book);
    }

    private Book find(Long id) {
        return books.findById(id).orElseThrow(() -> notFound("Book"));
    }

    private void apply(Book book, BookRequest request) {
        book.setTitle(request.title().trim());
        book.setAuthor(request.author().trim());
        book.setCategory(request.category().trim());
        book.setIsbn(request.isbn() == null || request.isbn().isBlank() ? null : request.isbn().trim());
        book.setDescription(blankToNull(request.description()));
        book.setCoverImageUrl(blankToNull(request.coverImageUrl()));
        book.setTotalCopies(request.totalCopies());
    }

    private BookResponse save(Book book) {
        try {
            return BookResponse.from(books.save(book));
        } catch (DataIntegrityViolationException exception) {
            throw new LibraryException(HttpStatus.CONFLICT, "A book with this ISBN already exists.");
        }
    }

    private static String cleanFilter(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static LibraryException notFound(String type) {
        return new LibraryException(HttpStatus.NOT_FOUND, type + " was not found.");
    }
}
