CREATE DATABASE IF NOT EXISTS online_library
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE online_library;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password VARCHAR(60) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS books (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    isbn VARCHAR(30) NULL,
    description TEXT NULL,
    cover_image_url VARCHAR(1000) NULL,
    total_copies INT NOT NULL,
    available_copies INT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uq_books_isbn UNIQUE (isbn),
    CONSTRAINT chk_books_total_copies CHECK (total_copies >= 1),
    CONSTRAINT chk_books_available_copies CHECK (available_copies >= 0 AND available_copies <= total_copies),
    INDEX idx_books_title (title),
    INDEX idx_books_author (author),
    INDEX idx_books_category (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS borrow_records (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    borrowed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    due_date DATE NOT NULL,
    returned_at TIMESTAMP(6) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',
    PRIMARY KEY (id),
    CONSTRAINT fk_records_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_records_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE RESTRICT,
    CONSTRAINT chk_records_status CHECK (status IN ('BORROWED', 'RETURNED')),
    INDEX idx_records_user_status (user_id, status),
    INDEX idx_records_borrowed_at (borrowed_at)
) ENGINE=InnoDB;
