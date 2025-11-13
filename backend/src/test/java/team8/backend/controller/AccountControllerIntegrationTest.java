package team8.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

import team8.backend.BackendApplication;
import team8.backend.entity.Account;
import team8.backend.entity.User;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.UserRepository;
import team8.backend.repository.TransactionRepository;
import team8.backend.repository.HoldingRepository;

import java.util.HashMap;
import java.util.Map;
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
        "MYSQL_DATABASE=testdb",
        "MYSQL_USER=testuser",
        "MYSQL_ROOT_PASSWORD=rootpass",
        "MYSQL_PASSWORD=testpass",
        "FINNHUB_API_KEY=dummy_finnhub_key",
        "MASSIVE_API_KEY=dummy_massive_key"
    }
)
public class AccountControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private HoldingRepository holdingRepository;

    private String baseUrl;

    private User testUser;
    private Account testAccount;

    @BeforeEach
    public void setUp() {
        baseUrl = "http://localhost:" + port + "/api/accounts";
        transactionRepository.deleteAll();
        holdingRepository.deleteAll();
        accountRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test" + UUID.randomUUID() + "@example.com"); // unique email
        testUser.setPassword("pass123");
        userRepository.save(testUser);

        testAccount = new Account();
        testAccount.setUser(testUser);
        testAccount.setCash(10_000.0);
        accountRepository.save(testAccount);
    }

    @Test
    public void testGetAccountsByUser() {
        ResponseEntity<Object[]> response = restTemplate.getForEntity(
                baseUrl + "?userId=" + testUser.getId(),
                Object[].class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    public void testGetSingleAccount() {
        ResponseEntity<Object> response = restTemplate.getForEntity(
                baseUrl + "/" + testAccount.getId(),
                Object.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    public void testTradeBuyAndSell() {
        // BUY
        Map<String, Object> buyRequest = new HashMap<>();
        buyRequest.put("action", "buy");
        buyRequest.put("ticker", "AAPL");
        buyRequest.put("shares", 5);
        buyRequest.put("price", 100.0);

        ResponseEntity<Map<String, Object>> buyResponse = restTemplate.exchange(
                baseUrl + "/" + testAccount.getId() + "/trade",
                HttpMethod.POST,
                new HttpEntity<>(buyRequest),
                new ParameterizedTypeReference<>() {}
        );
        assertThat(buyResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(holdingRepository.findByAccountId(testAccount.getId())).hasSize(1);

        // SELL
        Map<String, Object> sellRequest = new HashMap<>();
        sellRequest.put("action", "sell");
        sellRequest.put("ticker", "AAPL");
        sellRequest.put("shares", 5);
        sellRequest.put("price", 100.0);

        ResponseEntity<Map<String, Object>> sellResponse = restTemplate.exchange(
                baseUrl + "/" + testAccount.getId() + "/trade",
                HttpMethod.POST,
                new HttpEntity<>(sellRequest),
                new ParameterizedTypeReference<>() {}
        );
        assertThat(sellResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(holdingRepository.findByAccountId(testAccount.getId())).isEmpty();
    }

    @Test
    public void testTradeBuyInsufficientFunds() {
        Map<String, Object> request = new HashMap<>();
        request.put("action", "buy");
        request.put("ticker", "GOOG");
        request.put("shares", 1_000);
        request.put("price", 100.0);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/" + testAccount.getId() + "/trade",
                request,
                String.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Not enough cash");
    }

    @Test
    public void testDashboardSummary() {
        Map<String, Object> buyRequest = new HashMap<>();
        buyRequest.put("action", "buy");
        buyRequest.put("ticker", "MSFT");
        buyRequest.put("shares", 2);
        buyRequest.put("price", 50.0);

        restTemplate.exchange(
                baseUrl + "/" + testAccount.getId() + "/trade",
                HttpMethod.POST,
                new HttpEntity<>(buyRequest),
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                baseUrl + "/dashboard?userId=" + testUser.getId(),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> body = response.getBody();
        assertThat(body).containsKeys("totalCash", "totalStocks");
    }

    @Test
    public void testGetAllAccounts() {
        Account secondAccount = new Account();
        secondAccount.setUser(testUser);
        secondAccount.setCash(5_000.0);
        accountRepository.save(secondAccount);

        ResponseEntity<Object[]> response = restTemplate.getForEntity(
                baseUrl + "/all",
                Object[].class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }
}