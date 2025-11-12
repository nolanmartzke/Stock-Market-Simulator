package team8.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team8.backend.dto.TransactionDTO;
import team8.backend.repository.AccountRepository;
import team8.backend.repository.TransactionRepository;

/**
 * Controller providing transaction retrieval endpoints.
 * Supports listing transactions for an account and fetching a single transaction by id.
 */
@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    /**
     * Get all transactions for the specified account, ordered by timestamp (desc).
     *
     * @param accountId id of the account to retrieve transactions for
     * @return 200 with a list of TransactionDTO or 404 when account not found
     */
    @GetMapping
    public ResponseEntity<java.util.List<TransactionDTO>> getTransactions(@RequestParam(name = "accountId") Long accountId) {
        var accountOpt = accountRepository.findById(accountId);
        if (accountOpt.isEmpty()) return ResponseEntity.notFound().build();

        var transactions = TransactionDTO.fromEntities(
                transactionRepository.findByAccountOrderByTimestampDesc(accountOpt.get())
        );

        return ResponseEntity.ok(transactions);
    }

    /**
     * Retrieve a single transaction by id.
     *
     * @param id transaction id
     * @return 200 with TransactionDTO when found, 404 otherwise
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable(name = "id") Long id) {
        var txOpt = transactionRepository.findById(id);
        return txOpt.map(tx -> ResponseEntity.ok(TransactionDTO.fromEntity(tx)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
