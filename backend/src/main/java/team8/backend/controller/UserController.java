package team8.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import team8.backend.config.PasswordUtils;
import team8.backend.entity.User;
import team8.backend.repository.UserRepository;
import team8.backend.repository.AccountRepository;
import team8.backend.entity.Account;
import team8.backend.dto.AccountDTO;
import team8.backend.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Controller handling user registration, authentication, and user listing.
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    /**
     * Register a new user and create a primary account for them.
     * Password will be hashed before saving.
     *
     * @param user user object (email, password, etc.)
     * @return 201 with created UserDTO, 409 when email already exists
     */
    @PostMapping("/signup")
    public ResponseEntity<UserDTO> addUser(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        String hashedPassword = PasswordUtils.hashPassword(user.getPassword());
        user.setPassword(hashedPassword);

        User savedUser = userRepository.save(user);

        // Create primary account with 10000 cash
        Account primaryAccount = new Account(savedUser, "Primary Account", 10000.0);
        accountRepository.save(primaryAccount);

        return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromEntity(savedUser));
    }

    /**
     * Authenticate a user by email/password and update lastLoginAt on success.
     *
     * @param loginRequest user object containing email and plaintext password
     * @return 200 with UserDTO on success, 401 on invalid credentials, 404 if user not found
     */
    @PostMapping("/login")
    public ResponseEntity<UserDTO> loginUser(@RequestBody User loginRequest) {
        Optional<User> optionalUser = userRepository.findAll()
                .stream()
                .filter(u -> u.getEmail().equals(loginRequest.getEmail()))
                .findFirst();

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = optionalUser.get();

        // Hashed password check using BCrypt
        if (!PasswordUtils.checkPassword(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Update lastLoginAt
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * Retrieve all users (admin/testing use).
     *
     * @return 200 with a list of UserDTO for all users
     */
    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> dtos = users.stream().map(UserDTO::fromEntity).toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{userId}/accounts")
    public ResponseEntity<AccountDTO> createAdditionalAccount(
            @PathVariable Long userId,
            @RequestParam String name  // frontend sends ?name=MyAccount
    ) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = optionalUser.get();

        // Create account with provided name, 10000 initial cash
        Account newAccount = new Account(user, name, 10000.0);
        accountRepository.save(newAccount);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(AccountDTO.fromEntity(newAccount));
    }

    @GetMapping("/{userId}/accounts")
    public ResponseEntity<List<AccountDTO>> getAccountsForUser(@PathVariable Long userId) {

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = optionalUser.get();

        List<AccountDTO> dtos = accountRepository.findByUser(user)
                .stream()
                .map(AccountDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(dtos);
    }
}