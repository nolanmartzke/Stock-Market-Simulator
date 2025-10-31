package team8.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "holdings")
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many holdings belong to one account
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "stock_ticker", nullable = false)
    private String stockTicker;

    @Column(name = "shares", nullable = false)
    private int shares;

    @Column(name = "average_price", nullable = false)
    private double averagePrice;

    // Constructors
    public Holding() {}

    public Holding(Account account, String stockTicker, int shares, double averagePrice) {
        this.account = account;
        this.stockTicker = stockTicker;
        this.shares = shares;
        this.averagePrice = averagePrice;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public String getStockTicker() {
        return stockTicker;
    }

    public void setStockTicker(String stockTicker) {
        this.stockTicker = stockTicker;
    }

    public int getShares() {
        return shares;
    }

    public void setShares(int shares) {
        this.shares = shares;
    }

    public double getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(double averagePrice) {
        this.averagePrice = averagePrice;
    }
}