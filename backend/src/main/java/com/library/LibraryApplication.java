package com.library;

import com.library.model.AppUser;
import com.library.model.Role;
import com.library.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class LibraryApplication {
    public static void main(String[] args) {
        SpringApplication.run(LibraryApplication.class, args);
    }

    @Bean
    CommandLineRunner createConfiguredAdministrator(
            UserRepository users, PasswordEncoder passwordEncoder,
            org.springframework.core.env.Environment environment) {
        return args -> {
            String email = environment.getProperty("app.admin.email", "").trim();
            String password = environment.getProperty("app.admin.password", "");
            if (email.isEmpty() || password.isEmpty() || users.existsByEmailIgnoreCase(email)) return;
            AppUser administrator = new AppUser();
            administrator.setName("Library Administrator");
            administrator.setEmail(email);
            administrator.setPassword(passwordEncoder.encode(password));
            administrator.setRole(Role.ADMIN);
            users.save(administrator);
        };
    }
}
