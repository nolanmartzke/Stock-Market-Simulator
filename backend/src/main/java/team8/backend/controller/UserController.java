package team8.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import team8.backend.config.PasswordUtils;
import team8.backend.entity.User;
import team8.backend.repository.UserRepository;
import team8.backend.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Signup endpoint
    @PostMapping("/signup")
    public ResponseEntity<UserDTO> addUser(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        String hashedPassword = PasswordUtils.hashPassword(user.getPassword());
        user.setPassword(hashedPassword);


        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromEntity(savedUser));
    }

    // Login endpoint
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

    // Get all users
    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> dtos = users.stream().map(UserDTO::fromEntity).toList();
        return ResponseEntity.ok(dtos);
    }
}