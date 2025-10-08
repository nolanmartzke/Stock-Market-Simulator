package team8.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;


@Entity // marks this class as a JPA entity, Spring Boot automatically creates corresponding table in DB
@Table(name = "users") // names table "users" in the DB to prevent any potential issues caused by naming it a reserved keyword (user)
public class User {

    // primary key
    @Id     
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // each variable below is a column in the DB, all (except lastLoginAt) must be specified (non null)
    // we must specify nullable = false because as a default nullable = true
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true) // emails must be unique
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, updatable = false) // should not be updated after entity creation
    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt; // will be null after signup until first login


    // automatically set createAt var on entity creation
    @PrePersist 
    protected void onSignup() {
        this.createdAt = LocalDateTime.now();
    }

    // getters and setters
    public Long getId(){return id;}

    public String getName(){return name;}
    public void setName(String name){this.name = name;}

    public String getEmail(){return email;}
    public void setEmail(String email){this.email = email;}

    public String getPassword(){return password;}
    public void setPassword(String password){this.password = password;}

    public LocalDateTime getCreatedAt(){return createdAt;}

    public LocalDateTime getLastLoginAt(){return lastLoginAt;}
    public void setLastLoginAt(LocalDateTime lastLoginAt){this.lastLoginAt = lastLoginAt;}

}
