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
import team8.backend.entity.Tournament;
import team8.backend.entity.User;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.TournamentRepository;
import team8.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.*;

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
                "FINNHUB_API_KEY=dummy",
                "MASSIVE_API_KEY=dummy"
        }
)
public class TournamentControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired private TestRestTemplate restTemplate;
    @Autowired private TournamentRepository tournamentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;

    private String baseUrl;

    private User testUser;
    private Tournament testTournament;

    @BeforeEach
    public void setUp() {
        baseUrl = "http://localhost:" + port + "/api/tournaments";

        accountRepository.deleteAll();
        tournamentRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setName("Tournament User");
        testUser.setEmail("test" + UUID.randomUUID() + "@example.com");
        testUser.setPassword("pass123");
        userRepository.save(testUser);

        // Create test tournament
        testTournament = new Tournament();
        testTournament.setName("Winter Cup");
        testTournament.setInitialCash(5000.0);
        testTournament.setMaxParticipants(3);
        testTournament.setStartDate(LocalDateTime.now());
        testTournament.setEndDate(LocalDateTime.now().plusDays(7));
        tournamentRepository.save(testTournament);
    }

    @Test
	public void testCreateTournament() {
		Map<String, Object> dto = new HashMap<>();
		dto.put("name", "Spring Showdown");
		dto.put("maxParticipants", 10);
		dto.put("initialCash", 3000.0);
		dto.put("startDate", LocalDateTime.now().toString());
		dto.put("endDate", LocalDateTime.now().plusDays(7).toString());

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(dto, headers);

		ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
				baseUrl,
				HttpMethod.POST,
				entity,
				new ParameterizedTypeReference<>() {}
		);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(response.getBody()).containsEntry("name", "Spring Showdown");
	}

    @Test
    public void testGetAllTournaments() {
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                baseUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    public void testEnterTournamentSuccess() {
        String url = baseUrl + "/" + testTournament.getId() + "/enter?userId=" + testUser.getId();

        ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).contains("User entered tournament successfully");

        // Verify account created
        List<Account> accounts = accountRepository.findByUser(testUser);
        assertThat(accounts).hasSize(1);
        assertThat(accounts.get(0).getTournament().getId()).isEqualTo(testTournament.getId());
        assertThat(accounts.get(0).getCash()).isEqualTo(5000.0);
    }

    @Test
    public void testEnterTournament_UserNotFound() {
        String url = baseUrl + "/" + testTournament.getId() + "/enter?userId=999999";

        ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).contains("User not found");
    }

    @Test
    public void testEnterTournament_TournamentNotFound() {
        String url = baseUrl + "/999999/enter?userId=" + testUser.getId();

        ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).contains("Tournament not found");
    }

    @Test
    public void testEnterTournament_AlreadyEntered() {
        // First entry
        restTemplate.postForEntity(
                baseUrl + "/" + testTournament.getId() + "/enter?userId=" + testUser.getId(),
                null,
                String.class
        );

        // Second attempt
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/" + testTournament.getId() + "/enter?userId=" + testUser.getId(),
                null,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("User already entered this tournament");
    }

    @Test
    public void testEnterTournament_FullTournament() {
        testTournament.setMaxParticipants(1);
        tournamentRepository.save(testTournament);

        // First user enters
        restTemplate.postForEntity(
                baseUrl + "/" + testTournament.getId() + "/enter?userId=" + testUser.getId(),
                null,
                String.class
        );

        // Second user
        User secondUser = new User();
        secondUser.setName("Player2");
        secondUser.setEmail("u2" + UUID.randomUUID() + "@example.com");
        secondUser.setPassword("p");
        userRepository.save(secondUser);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/" + testTournament.getId() + "/enter?userId=" + secondUser.getId(),
                null,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Tournament is full");
    }

    @Test
    public void testGetLeaderboard() {
        restTemplate.postForEntity(
                baseUrl + "/" + testTournament.getId() + "/enter?userId=" + testUser.getId(),
                null,
                String.class
        );

        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                baseUrl + "/" + testTournament.getId() + "/leaderboard",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);

        Map<String, Object> row = response.getBody().get(0);

        assertThat(row).containsKeys(
                "accountName",
                "cash",
                "totalHoldingValue"
        );
    }

	@Test
	public void testUpdateTournament() {
		String url = baseUrl + "/" + testTournament.getId();

		Map<String, Object> body = new HashMap<>();
		body.put("name", "Updated Name");
		body.put("maxParticipants", 20);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

		ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
				url,
				HttpMethod.PATCH,
				entity,
				new ParameterizedTypeReference<>() {}
		);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).containsEntry("name", "Updated Name");
		assertThat(response.getBody()).containsEntry("maxParticipants", 20);
	}

	@Test
	public void testDeleteTournament() {
		String url = baseUrl + "/" + testTournament.getId();

		ResponseEntity<String> response = restTemplate.exchange(
				url,
				HttpMethod.DELETE,
				null,
				String.class
		);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).contains("Tournament deleted successfully");

		assertThat(tournamentRepository.findById(testTournament.getId())).isEmpty();
	}

	@Test
	public void testLeaveTournament() {
		restTemplate.postForEntity(
				baseUrl + "/" + testTournament.getId() + "/enter?userId=" + testUser.getId(),
				null,
				String.class
		);

		String url = baseUrl + "/" + testTournament.getId() + "/leave?userId=" + testUser.getId();

		ResponseEntity<String> response = restTemplate.exchange(
				url,
				HttpMethod.DELETE,
				null,
				String.class
		);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).contains("User left the tournament successfully");

		List<Account> accounts = accountRepository.findByUser(testUser);
		assertThat(accounts).isEmpty();
	}
}