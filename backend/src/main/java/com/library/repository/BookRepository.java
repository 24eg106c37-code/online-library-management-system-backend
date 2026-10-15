package com.library.repository;

import com.library.model.Book;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {
    @Query("""
            select b from Book b
            where (:query is null or lower(b.title) like lower(concat('%', :query, '%'))
                or lower(b.author) like lower(concat('%', :query, '%')))
              and (:category is null or lower(b.category) = lower(:category))
            order by b.title
            """)
    List<Book> search(@Param("query") String query, @Param("category") String category);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Book b where b.id = :id")
    Optional<Book> findByIdForUpdate(@Param("id") Long id);
}
