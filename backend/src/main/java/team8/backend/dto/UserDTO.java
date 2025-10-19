package team8.backend.dto;

import java.time.LocalDateTime;
import team8.backend.entity.User;

/**
 * Data Transfer Object for User entity that excludes password fields.
 */
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    public UserDTO() {}

    public UserDTO(Long id, String name, String email, LocalDateTime createdAt, LocalDateTime lastLoginAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    // helper to create DTO from entity
    public static UserDTO fromEntity(User u) {
        if (u == null) return null;
        return new UserDTO(u.getId(), u.getName(), u.getEmail(), u.getCreatedAt(), u.getLastLoginAt());
    }

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
}
