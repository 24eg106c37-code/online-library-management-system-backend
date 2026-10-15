package com.library.service;

import com.library.dto.ApiDtos.AuthResponse;
import com.library.dto.ApiDtos.RegisterRequest;
import com.library.dto.ApiDtos.UserResponse;
import com.library.exception.LibraryException;
import com.library.model.AppUser;
import com.library.model.Role;
import com.library.repository.UserRepository;
import com.library.security.JwtService;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new LibraryException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        user = users.save(user);
        return new AuthResponse(jwtService.generate(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String emailInput, String password) {
        AppUser user = users.findByEmailIgnoreCase(emailInput.trim())
                .filter(candidate -> passwordEncoder.matches(password, candidate.getPassword()))
                .orElseThrow(() -> new LibraryException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect."));
        return new AuthResponse(jwtService.generate(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(String email) {
        return users.findByEmailIgnoreCase(email)
                .map(UserResponse::from)
                .orElseThrow(() -> new LibraryException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
    }
}
