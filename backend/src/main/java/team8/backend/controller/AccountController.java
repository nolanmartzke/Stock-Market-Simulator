package team8.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team8.backend.entity.Account;
import team8.backend.entity.User;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    // ===== Get all accounts for a user =====
    @GetMapping
    public ResponseEntity<List<Account>> getAccounts(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<Account> accounts = accountRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(accounts);
    }

    // ===== Get account details =====
    @GetMapping("/{accountId}")
    public ResponseEntity<Account> getAccount(@PathVariable Long accountId) {
        Optional<Account> accountOpt = accountRepository.findById(accountId);
        return accountOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ===== Deposit =====
    @PostMapping("/{accountId}/deposit")
    public ResponseEntity<Account> deposit(@PathVariable Long accountId, @RequestBody Map<String, Double> body) {
        double amount = body.getOrDefault("amount", 0.0);
        if (amount <= 0) return ResponseEntity.badRequest().build();

        Optional<Account> accOpt = accountRepository.findById(accountId);
        if (accOpt.isEmpty()) return ResponseEntity.notFound().build();

        Account acc = accOpt.get();
        acc.setCash(acc.getCash() + amount);
        accountRepository.save(acc);

        return ResponseEntity.ok(acc);
    }

    // ===== Withdraw =====
    @PostMapping("/{accountId}/withdraw")
    public ResponseEntity<Account> withdraw(@PathVariable Long accountId, @RequestBody Map<String, Double> body) {
        double amount = body.getOrDefault("amount", 0.0);
        if (amount <= 0) return ResponseEntity.badRequest().build();

        Optional<Account> accOpt = accountRepository.findById(accountId);
        if (accOpt.isEmpty()) return ResponseEntity.notFound().build();

        Account acc = accOpt.get();
        if (acc.getCash() < amount) return ResponseEntity.badRequest().build();

        acc.setCash(acc.getCash() - amount);
        accountRepository.save(acc);

        return ResponseEntity.ok(acc);
    }

    // ===== Trade endpoint (buy/sell shares) =====
    @PostMapping("/{accountId}/trade")
    public ResponseEntity<Account> trade(@PathVariable Long accountId, @RequestBody Map<String, Object> body) {
        String action = (String) body.get("action"); // buy or sell
        String ticker = (String) body.get("ticker");
        Integer shares = (Integer) body.get("shares");
        Double pricePerShare = (Double) body.get("price"); // assume frontend passes price

        if (ticker == null || shares == null || shares <= 0 || action == null) return ResponseEntity.badRequest().build();

        Optional<Account> accOpt = accountRepository.findById(accountId);
        if (accOpt.isEmpty()) return ResponseEntity.notFound().build();

        Account acc = accOpt.get();
        Map<String, Integer> positions = acc.getStockPositions();

        double totalCost = shares * pricePerShare;

        if (action.equalsIgnoreCase("buy")) {
            if (acc.getCash() < totalCost) return ResponseEntity.badRequest().body(acc); // not enough cash
            acc.setCash(acc.getCash() - totalCost);
            positions.put(ticker, positions.getOrDefault(ticker, 0) + shares);
        } else if (action.equalsIgnoreCase("sell")) {
            int currentShares = positions.getOrDefault(ticker, 0);
            if (currentShares < shares) return ResponseEntity.badRequest().body(acc); // not enough shares
            positions.put(ticker, currentShares - shares);
            acc.setCash(acc.getCash() + totalCost);
        } else {
            return ResponseEntity.badRequest().build();
        }

        acc.setStockPositions(positions);
        accountRepository.save(acc);
        return ResponseEntity.ok(acc);
    }

    // ===== Dashboard endpoint (simplified) =====
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<Account> accounts = accountRepository.findByUser(userOpt.get());

        double totalCash = accounts.stream().mapToDouble(Account::getCash).sum();
        Map<String, Integer> totalStocks = accounts.stream()
                .flatMap(a -> a.getStockPositions().entrySet().stream())
                .collect(java.util.stream.Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        Integer::sum
                ));

        Map<String, Object> response = Map.of(
                "totalCash", totalCash,
                "totalStocks", totalStocks
        );

        return ResponseEntity.ok(response);
    }
}
