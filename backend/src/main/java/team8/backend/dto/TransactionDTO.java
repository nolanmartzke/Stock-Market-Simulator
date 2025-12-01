package team8.backend.dto;

import team8.backend.entity.Transaction;

import java.time.LocalDateTime;

public class TransactionDTO {

    private Long id;
    private Long accountId;
    private String action;
    private String stockTicker;
    private double shares;
    private double price;
    private LocalDateTime timestamp;

    public TransactionDTO() {}

    public TransactionDTO(Long id, Long accountId, String action, String stockTicker, double shares, double price, LocalDateTime timestamp) {
        this.id = id;
        this.accountId = accountId;
        this.action = action;
        this.stockTicker = stockTicker;
        this.shares = shares;
        this.price = price;
        this.timestamp = timestamp;
    }

    // Factory method
    public static TransactionDTO fromEntity(Transaction tx) {
        return new TransactionDTO(
                tx.getId(),
                tx.getAccount().getId(),  // safe: only fetches ID
                tx.getAction(),
                tx.getStockTicker(),
                tx.getShares(),
                tx.getPrice(),
                tx.getTimestamp()
        );
    }

    // convert list of entities
    public static java.util.List<TransactionDTO> fromEntities(java.util.List<Transaction> txs) {
        return txs.stream().map(TransactionDTO::fromEntity).toList();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getStockTicker() { return stockTicker; }
    public void setStockTicker(String stockTicker) { this.stockTicker = stockTicker; }

    public double getShares() { return shares; }
    public void setShares(double shares) { this.shares = shares; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public java.time.LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(java.time.LocalDateTime timestamp) { this.timestamp = timestamp; }
}