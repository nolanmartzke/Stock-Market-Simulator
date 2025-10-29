package team8.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team8.backend.entity.*;
import team8.backend.repository.*;
import team8.backend.service.HoldingService;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HoldingService holdingService;

    // ===== Get all accounts for a user =====
    @GetMapping
    public ResponseEntity<List<Account>> getAccounts(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<Account> accounts = accountRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(accounts);
    }

    // ===== Get single account (with holdings) =====
    @GetMapping("/{accountId}")
    public ResponseEntity<Account> getAccount(@PathVariable Long accountId) {
        Optional<Account> accountOpt = accountRepository.findById(accountId);
        return accountOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ===== Trade endpoint (buy/sell shares) =====
@PostMapping("/{accountId}/trade")
public ResponseEntity<?> trade(@PathVariable Long accountId, @RequestBody Map<String, Object> body) {
    String action = (String) body.get("action"); // "buy" or "sell"
    String ticker = (String) body.get("ticker");
    Integer shares = (Integer) body.get("shares");
    Double price = (Double) body.get("price");

    if (ticker == null || shares == null || shares <= 0 || action == null || price == null) {
        return ResponseEntity.badRequest().body("Invalid trade parameters.");
    }

    Optional<Account> accOpt = accountRepository.findById(accountId);
    if (accOpt.isEmpty()) return ResponseEntity.notFound().build();
    Account account = accOpt.get();

    double totalValue = shares * price;

    try {
        if (action.equalsIgnoreCase("buy")) {
            if (account.getCash() < totalValue) {
                return ResponseEntity.badRequest().body("Not enough cash to complete purchase.");
            }
            account.setCash(account.getCash() - totalValue);
            holdingService.addOrUpdateHolding(account, ticker, shares, price);

        } else if (action.equalsIgnoreCase("sell")) {
            // Delegate sell logic entirely to HoldingService
            holdingService.updateAfterSell(account, ticker, shares);

            // Add cash from sale
            account.setCash(account.getCash() + totalValue);

        } else {
            return ResponseEntity.badRequest().body("Invalid action type. Must be 'buy' or 'sell'.");
        }

        accountRepository.save(account);
        return ResponseEntity.ok(account);

    } catch (IllegalArgumentException e) {
        // Handle errors thrown from HoldingService (e.g., not enough shares)
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

    // ===== Dashboard =====
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<Account> accounts = accountRepository.findByUser(userOpt.get());

        double totalCash = accounts.stream().mapToDouble(Account::getCash).sum();

        // Aggregate all holdings from all accounts
        Map<String, Integer> totalStocks = accounts.stream()
                .flatMap(a -> a.getHoldings().stream())
                .collect(Collectors.toMap(
                        Holding::getStockTicker,
                        Holding::getShares,
                        Integer::sum
                ));

        Map<String, Object> response = Map.of(
                "totalCash", totalCash,
                "totalStocks", totalStocks
        );

        return ResponseEntity.ok(response);
    }
}
