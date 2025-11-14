package team8.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import team8.backend.BackendApplication;
import team8.backend.dto.UserDTO;
import team8.backend.entity.User;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for UserController endpoints.
 * These tests use an H2 in-memory database (configured in application-test.properties)
 * and make real HTTP requests to test the API endpoints.
 */
@SpringBootTest(
    classes = BackendApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT  // Start a real web server on a random port
)
@ActiveProfiles("test")  // Use test profile (loads application-test.properties)
public class UserControllerIntegrationTest {

    @LocalServerPort
    private int port;  // The random port assigned to the test web server

    @Autowired
    private TestRestTemplate restTemplate;  // Used to make HTTP requests to test endpoints

    @Autowired
    private UserRepository userRepository;  // Used to verify database state after API calls

    @Autowired
    private AccountRepository accountRepository;  // Used to verify accounts are created correctly

    private String baseUrl;  // Base URL for API endpoints (e.g., "http://localhost:12345/api/users")

    /**
     * Runs before each test method.
     * Cleans the database so each test starts with a fresh state.
     */
    @BeforeEach
    public void setUp() {
        baseUrl = "http://localhost:" + port + "/api/users";
        // Clean database before each test to ensure test isolation
        accountRepository.deleteAll();  // Delete all accounts first (due to foreign key constraints)
        userRepository.deleteAll();     // Then delete all users
    }

    /**
     * Test user signup endpoint.
     * Verifies that:
     * - User can register with name, email, and password
     * - User is saved to database
     * - Account is automatically created for the user
     * - Password is hashed (not stored in plain text)
     */
    @Test
    public void testSignup() {
        // Step 1: Create a new user request
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setPassword("password123");  // Plain text password (will be hashed by the API)

        // Step 2: Send POST request to /api/users/signup endpoint
        ResponseEntity<UserDTO> response = restTemplate.postForEntity(
                baseUrl + "/signup",
                user,
                UserDTO.class
        );

        // Step 3: Verify the response
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);  // Should return 201 Created
        assertThat(response.getBody()).isNotNull();  // Response body should not be null
        assertThat(response.getBody().getEmail()).isEqualTo("john@example.com");  // Email should match
        
        // Step 4: Verify database state
        assertThat(userRepository.count()).isEqualTo(1);  // Exactly one user should be saved
        assertThat(accountRepository.count()).isEqualTo(1);  // Exactly one account should be auto-created
        
        // Step 5: Verify password security (password should be hashed, not plain text)
        User savedUser = userRepository.findAll().get(0);
        assertThat(savedUser.getPassword()).startsWith("$2a$");  // BCrypt hash starts with "$2a$"
    }

    /**
     * Test that signup prevents duplicate emails.
     * Verifies that attempting to register with an existing email returns 409 Conflict
     * and no duplicate user is created.
     */
    @Test
    public void testSignupDuplicateEmail() {
        // Step 1: Create and register first user
        User user = new User();
        user.setName("Jane Smith");
        user.setEmail("jane@example.com");
        user.setPassword("password456");
        restTemplate.postForEntity(baseUrl + "/signup", user, UserDTO.class);

        // Step 2: Attempt to register another user with the same email
        User duplicate = new User();
        duplicate.setName("Jane Duplicate");
        duplicate.setEmail("jane@example.com");  // Same email as first user
        duplicate.setPassword("different123");

        ResponseEntity<UserDTO> response = restTemplate.postForEntity(
                baseUrl + "/signup",
                duplicate,
                UserDTO.class
        );

        // Step 3: Verify that duplicate signup was rejected
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);  // Should return 409 Conflict
        assertThat(userRepository.count()).isEqualTo(1);  // Still only one user (duplicate was rejected)
    }

    /**
     * Test user login with correct credentials.
     * Verifies that:
     * - Login with correct email and password returns 200 OK
     * - User details are returned in response
     * - Last login timestamp is updated
     */
    @Test
    public void testLogin() {
        // Step 1: Create a user first (using signup endpoint so password is properly hashed)
        User user = new User();
        user.setName("Jane Smith");
        user.setEmail("jane@example.com");
        user.setPassword("pass456");
        restTemplate.postForEntity(baseUrl + "/signup", user, UserDTO.class);

        // Step 2: Attempt to login with correct credentials
        User loginRequest = new User();
        loginRequest.setEmail("jane@example.com");
        loginRequest.setPassword("pass456");  // Correct password

        ResponseEntity<UserDTO> response = restTemplate.postForEntity(
                baseUrl + "/login",
                loginRequest,
                UserDTO.class
        );

        // Step 3: Verify successful login
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);  // Should return 200 OK
        assertThat(response.getBody()).isNotNull();  // Response should contain user data
        assertThat(response.getBody().getEmail()).isEqualTo("jane@example.com");  // Email should match
        assertThat(response.getBody().getLastLoginAt()).isNotNull();  // Last login timestamp should be set
    }

    /**
     * Test login with incorrect password.
     * Verifies that login with wrong password returns 401 Unauthorized.
     */
    @Test
    public void testLoginWrongPassword() {
        // Step 1: Create a user first
        User user = new User();
        user.setName("Bob User");
        user.setEmail("bob@example.com");
        user.setPassword("correctPass");
        restTemplate.postForEntity(baseUrl + "/signup", user, UserDTO.class);

        // Step 2: Attempt to login with wrong password
        User loginRequest = new User();
        loginRequest.setEmail("bob@example.com");
        loginRequest.setPassword("wrongPass");  // Incorrect password

        ResponseEntity<UserDTO> response = restTemplate.postForEntity(
                baseUrl + "/login",
                loginRequest,
                UserDTO.class
        );

        // Step 3: Verify that login was rejected
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);  // Should return 401 Unauthorized
    }

    /**
     * Test login with non-existent user email.
     * Verifies that login attempt with an email that doesn't exist returns 404 Not Found.
     */
    @Test
    public void testLoginNonExistentUser() {
        // Step 1: Attempt to login with an email that was never registered
        User loginRequest = new User();
        loginRequest.setEmail("nonexistent@example.com");  // This email doesn't exist in database
        loginRequest.setPassword("anyPassword");

        ResponseEntity<UserDTO> response = restTemplate.postForEntity(
                baseUrl + "/login",
                loginRequest,
                UserDTO.class
        );

        // Step 2: Verify that login was rejected
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);  // Should return 404 Not Found
    }

    /**
     * Test getting all users endpoint.
     * Verifies that GET /api/users/all returns all registered users.
     */
    @Test
    public void testGetAllUsers() {
        // Step 1: Create two users
        User user1 = new User();
        user1.setName("User One");
        user1.setEmail("user1@example.com");
        user1.setPassword("pass1");
        restTemplate.postForEntity(baseUrl + "/signup", user1, UserDTO.class);

        User user2 = new User();
        user2.setName("User Two");
        user2.setEmail("user2@example.com");
        user2.setPassword("pass2");
        restTemplate.postForEntity(baseUrl + "/signup", user2, UserDTO.class);

        // Step 2: Get all users
        ResponseEntity<UserDTO[]> response = restTemplate.getForEntity(
                baseUrl + "/all",
                UserDTO[].class
        );

        // Step 3: Verify response
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);  // Should return 200 OK
        assertThat(response.getBody()).hasSize(2);  // Should return exactly 2 users
    }

    /**
     * Test getting all users when database is empty.
     * Verifies that GET /api/users/all returns an empty array (not null) when no users exist.
     */
    @Test
    public void testGetAllUsersEmpty() {
        // Step 1: Get all users without creating any users first
        // (Database is already empty due to setUp() method)
        ResponseEntity<UserDTO[]> response = restTemplate.getForEntity(
                baseUrl + "/all",
                UserDTO[].class
        );

        // Step 2: Verify response
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);  // Should return 200 OK
        assertThat(response.getBody()).isEmpty();  // Should return empty array (not null)
    }
}