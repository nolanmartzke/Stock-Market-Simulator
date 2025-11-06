package team8.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team8.backend.dto.TransactionDTO;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.TransactionRepository;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    // Get all transactions for an account
    @GetMapping
    public ResponseEntity<java.util.List<TransactionDTO>> getTransactions(@RequestParam Long accountId) {
        var accountOpt = accountRepository.findById(accountId);
        if (accountOpt.isEmpty()) return ResponseEntity.notFound().build();

        var transactions = TransactionDTO.fromEntities(
                transactionRepository.findByAccountOrderByTimestampDesc(accountOpt.get())
        );

        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable Long id) {
        var txOpt = transactionRepository.findById(id);
        return txOpt.map(tx -> ResponseEntity.ok(TransactionDTO.fromEntity(tx)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
