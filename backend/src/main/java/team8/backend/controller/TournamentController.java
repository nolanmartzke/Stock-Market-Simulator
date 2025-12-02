package team8.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.transaction.Transactional;
import team8.backend.dto.TournamentDTO;
import team8.backend.dto.TournamentCreateDTO;
import team8.backend.dto.TournamentLeaderboardDTO;
import team8.backend.entity.Account;
import team8.backend.entity.Tournament;
import team8.backend.entity.User;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.TournamentRepository;
import team8.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tournaments")
@CrossOrigin(origins = "http://localhost:5173")
public class TournamentController {

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    // --- Create a tournament ---
    @PostMapping
    public ResponseEntity<TournamentDTO> createTournament(@RequestBody TournamentCreateDTO dto) {
        Tournament tournament = new Tournament();
        tournament.setName(dto.getName());
        tournament.setMaxParticipants(dto.getMaxParticipants() != null ? dto.getMaxParticipants() : 10);
        tournament.setInitialCash(dto.getInitialCash() != null ? dto.getInitialCash() : 10000.0);
        tournament.setStartDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDateTime.now());
        tournament.setEndDate(dto.getEndDate() != null ? dto.getEndDate() : LocalDateTime.now().plusDays(7));

        Tournament saved = tournamentRepository.save(tournament);
        return ResponseEntity.status(HttpStatus.CREATED).body(TournamentDTO.fromEntity(saved));
    }

    // --- Get all tournaments ---
    @GetMapping
    public ResponseEntity<List<TournamentDTO>> getAllTournaments() {
        List<TournamentDTO> dtos = tournamentRepository.findAll()
                .stream()
                .map(TournamentDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // --- Enter a tournament ---
    @PostMapping("/{tournamentId}/enter")
    @Transactional
    public ResponseEntity<?> enterTournament(@PathVariable Long tournamentId, @RequestParam Long userId) {
        Optional<Tournament> tournamentOpt = tournamentRepository.findById(tournamentId);
        if (tournamentOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tournament not found");

        Tournament tournament = tournamentOpt.get();
        if (tournament.getParticipantCount() >= tournament.getMaxParticipants()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tournament is full");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

        User user = userOpt.get();

        boolean alreadyEntered = accountRepository.findByUser(user)
                .stream()
                .anyMatch(acc -> tournament.equals(acc.getTournament()));
        if (alreadyEntered) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User already entered this tournament");

        Account tournamentAccount = new Account(user, tournament.getName() + " Account", tournament.getInitialCash());
        tournament.addAccount(tournamentAccount);
        accountRepository.save(tournamentAccount);

        return ResponseEntity.status(HttpStatus.CREATED).body("User entered tournament successfully");
    }

    // --- Get tournament leaderboard ---
    @GetMapping("/{tournamentId}/leaderboard")
    public ResponseEntity<List<TournamentLeaderboardDTO>> getLeaderboard(@PathVariable Long tournamentId) {
        Optional<Tournament> tournamentOpt = tournamentRepository.findById(tournamentId);
        if (tournamentOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);

        Tournament tournament = tournamentOpt.get();

        List<TournamentLeaderboardDTO> leaderboard = tournament.getAccounts()
                .stream()
                .map(acc -> new TournamentLeaderboardDTO(
                        acc.getName(),
                        acc.getCash(),
                        acc.getHoldings().stream().mapToDouble(h -> h.getShares() * h.getAveragePrice()).sum()
                ))
                .sorted((a, b) -> Double.compare(
                        b.getTotalHoldingValue() + b.getCash(),
                        a.getTotalHoldingValue() + a.getCash()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(leaderboard);
    }

    // --- Get all tournaments a user is in ---
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TournamentDTO>> getTournamentsForUser(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);

        User user = userOpt.get();

        List<TournamentDTO> tournaments = accountRepository.findByUser(user)
                .stream()
                .map(Account::getTournament)
                .filter(t -> t != null)
                .map(TournamentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(tournaments);
    }
}