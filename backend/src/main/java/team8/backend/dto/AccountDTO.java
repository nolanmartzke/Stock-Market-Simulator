package team8.backend.dto;

import team8.backend.entity.Account;
import java.util.List;
import java.util.stream.Collectors;

public class AccountDTO {
    private Long id;
    private Long userId; // just the user ID
    private double cash;
    private List<HoldingDTO> holdings;
    private List<TransactionDTO> transactions;

    public AccountDTO() {}

    public AccountDTO(Long id, Long userId, double cash, List<HoldingDTO> holdings) {
        this.id = id;
        this.userId = userId;
        this.cash = cash;
        this.holdings = holdings;
    }

    // fromEntity method
    public static AccountDTO fromEntity(Account a) {
        AccountDTO dto = new AccountDTO();
        dto.setId(a.getId());
        dto.setUserId(a.getUser() != null ? a.getUser().getId() : null);
        dto.setCash(a.getCash());

        dto.setHoldings(
            a.getHoldings() != null
                ? a.getHoldings().stream().map(HoldingDTO::fromEntity).collect(Collectors.toList())
                : List.of()
        );

        dto.setTransactions(
            a.getTransactions() != null
                ? a.getTransactions().stream().map(TransactionDTO::fromEntity).collect(Collectors.toList())
                : List.of()
        );

        return dto;
    }

    // getters & setters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public double getCash() { return cash; }
    public List<HoldingDTO> getHoldings() { return holdings; }
    public List<TransactionDTO> getTransactions() { return transactions; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setCash(double cash) { this.cash = cash; }
    public void setHoldings(List<HoldingDTO> holdings) { this.holdings = holdings; }
    public void setTransactions(List<TransactionDTO> transactions) { this.transactions = transactions; }
}