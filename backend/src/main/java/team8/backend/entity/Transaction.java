package team8.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private String action; // "buy" or "sell"

    @Column(nullable = false)
    private String stockTicker;

    @Column(nullable = false)
    private double shares;

    @Column(nullable = false)
    private double price; // price per share at trade

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public Transaction() {}

    public Transaction(Account account, String action, String stockTicker, double shares, double price, LocalDateTime timestamp) {
        this.account = account;
        this.action = action;
        this.stockTicker = stockTicker;
        this.shares = shares;
        this.price = price;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getStockTicker() { return stockTicker; }
    public void setStockTicker(String stockTicker) { this.stockTicker = stockTicker; }

    public double getShares() { return shares; }
    public void setShares(double shares) { this.shares = shares; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}