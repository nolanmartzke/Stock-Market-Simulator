package team8.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.transaction.Transactional;
import team8.backend.dto.AccountDTO;
import team8.backend.entity.Account;
import team8.backend.entity.Holding;
import team8.backend.entity.User;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.UserRepository;
import team8.backend.service.HoldingService;
import team8.backend.entity.Transaction;
import team8.backend.repository.TransactionRepository;

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

    @Autowired
    private TransactionRepository transactionRepository;

    // Get all accounts for a user
    @GetMapping
    public ResponseEntity<List<AccountDTO>> getAccounts(@RequestParam(name = "userId") Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<Account> accounts = accountRepository.findByUser(userOpt.get());
        List<AccountDTO> dtos = accounts.stream()
                .map(AccountDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // Get single account (with holdings)
    @GetMapping("/{accountId}")
    public ResponseEntity<AccountDTO> getAccount(@PathVariable(name = "accountId") Long accountId) {
        Optional<Account> accountOpt = accountRepository.findById(accountId);
        return accountOpt.map(a -> ResponseEntity.ok(AccountDTO.fromEntity(a)))
                         .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Trade endpoint (buy/sell shares)
    @Transactional
    @PostMapping("/{accountId}/trade")
    public ResponseEntity<?> trade(@PathVariable(name = "accountId") Long accountId, @RequestBody Map<String, Object> body) {
        String action = (String) body.get("action"); // "buy" or "sell"
        String ticker = (String) body.get("ticker");
        Number sharesNum = (Number) body.get("shares");
        Number priceNum = (Number) body.get("price");

        if (ticker == null || sharesNum == null || priceNum == null || action == null) {
            return ResponseEntity.badRequest().body("Invalid trade parameters.");
        }

        int shares = sharesNum.intValue();
        double price = priceNum.doubleValue();

        if (shares <= 0 || price <= 0) {
            return ResponseEntity.badRequest().body("Shares and price must be greater than 0.");
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
                holdingService.updateAfterSell(account, ticker, shares);
                account.setCash(account.getCash() + totalValue);

            } else {
                return ResponseEntity.badRequest().body("Invalid action type. Must be 'buy' or 'sell'.");
            }


            // Save transaction
            Transaction tx = new Transaction(
                account,
                action.toLowerCase(),
                ticker,
                shares,
                price,
                java.time.LocalDateTime.now()
            );
            account.addTransaction(tx);

            transactionRepository.save(tx);
            accountRepository.save(account);

            return ResponseEntity.ok(AccountDTO.fromEntity(account));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@RequestParam(name = "userId") Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        List<Account> accounts = accountRepository.findByUser(userOpt.get());
        double totalCash = accounts.stream().mapToDouble(Account::getCash).sum();

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

    // Get ALL accounts (admin/testing)
    @GetMapping("/all")
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        List<AccountDTO> dtos = accounts.stream()
                .map(AccountDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
