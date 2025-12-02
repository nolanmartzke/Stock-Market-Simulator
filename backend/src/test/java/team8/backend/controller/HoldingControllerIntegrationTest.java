package team8.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import team8.backend.BackendApplication;
import team8.backend.dto.HoldingDTO;
import team8.backend.entity.Account;
import team8.backend.entity.Holding;
import team8.backend.entity.User;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.HoldingRepository;
import team8.backend.repository.UserRepository;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        classes = BackendApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                "spring.datasource.username=sa",
                "spring.datasource.password=",
                "spring.datasource.driver-class-name=org.h2.Driver",
                "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
                "spring.jpa.hibernate.ddl-auto=create",
                "spring.jpa.show-sql=true",
                "MYSQL_DATABASE=testdb",
                "MYSQL_USER=testuser",
                "MYSQL_ROOT_PASSWORD=rootpass",
                "MYSQL_PASSWORD=testpass",
                "FINNHUB_API_KEY=dummy_finnhub_key",
                "MASSIVE_API_KEY=dummy_massive_key"
        }
)
public class HoldingControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private HoldingRepository holdingRepository;

    private String baseUrl;
    private User testUser;
    private Account testAccount;
    private Holding testHolding;

    @BeforeEach
    public void setUp() {
        baseUrl = "http://localhost:" + port + "/api/holdings";
        holdingRepository.deleteAll();
        accountRepository.deleteAll();
        userRepository.deleteAll();

        // Create a user
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("user" + UUID.randomUUID() + "@example.com");
        testUser.setPassword("pass123");
        userRepository.save(testUser);

        // Create an account
        testAccount = new Account();
        testAccount.setUser(testUser);
        testAccount.setCash(10_000.0);
        accountRepository.save(testAccount);

        // Create a holding
        testHolding = new Holding();
        testHolding.setAccount(testAccount);
        testHolding.setStockTicker("AAPL");
        testHolding.setShares(10);
        testHolding.setAveragePrice(150.0);
        holdingRepository.save(testHolding);
    }

    @Test
    public void testGetHoldingsByAccount() {
        ResponseEntity<HoldingDTO[]> response = restTemplate.getForEntity(
                baseUrl + "/account/" + testAccount.getId(),
                HoldingDTO[].class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        HoldingDTO[] holdings = response.getBody();
        assertThat(holdings).isNotNull();
        assertThat(holdings).hasSize(1);
        assertThat(holdings[0].getStockTicker()).isEqualTo("AAPL");
        assertThat(holdings[0].getShares()).isEqualTo(10);
        assertThat(holdings[0].getAveragePrice()).isEqualTo(150.0);
    }

    @Test
    public void testDeleteHolding() {
        // Ensure the holding exists
        assertThat(holdingRepository.findById(testHolding.getId())).isPresent();

        // Delete the holding
        ResponseEntity<Void> response = restTemplate.exchange(
                baseUrl + "/" + testHolding.getId(),
                HttpMethod.DELETE,
                null,
                Void.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Verify it was deleted
        assertThat(holdingRepository.findById(testHolding.getId())).isNotPresent();
    }
}