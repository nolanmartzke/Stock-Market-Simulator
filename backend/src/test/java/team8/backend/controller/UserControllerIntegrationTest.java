package team8.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import team8.backend.BackendApplication;
import team8.backend.entity.User;
import team8.backend.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
    classes = BackendApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create",
        "spring.jpa.show-sql=true"
    }
)
public class UserControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    private String baseUrl;

    @BeforeEach
    public void setUp() {
        baseUrl = "http://localhost:" + port + "/api/users";
        userRepository.deleteAll();
    }

    @Test
    public void testSignup() {
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setPassword("password123");

        ResponseEntity<User> response = restTemplate.postForEntity(
                baseUrl + "/signup",
                user,
                User.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    public void testLogin() {
        User user = new User();
        user.setName("Jane Smith");
        user.setEmail("jane@example.com");
        user.setPassword("pass456");
        userRepository.save(user);

        User loginRequest = new User();
        loginRequest.setEmail("jane@example.com");
        loginRequest.setPassword("pass456");

        ResponseEntity<User> response = restTemplate.postForEntity(
                baseUrl + "/login",
                loginRequest,
                User.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void testGetAllUsers() {
        User user1 = new User();
        user1.setName("User One");
        user1.setEmail("user1@example.com");
        user1.setPassword("pass1");
        userRepository.save(user1);

        User user2 = new User();
        user2.setName("User Two");
        user2.setEmail("user2@example.com");
        user2.setPassword("pass2");
        userRepository.save(user2);

        ResponseEntity<User[]> response = restTemplate.getForEntity(
                baseUrl + "/all",
                User[].class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }
}
