package team8.backend.entity;

import jakarta.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many accounts can belong to one user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private double cash = 0.0;

    // Store stockTicker -> #shares
    @ElementCollection
    @CollectionTable(name = "account_stocks", joinColumns = @JoinColumn(name = "account_id"))
    @MapKeyColumn(name = "stock_ticker")
    @Column(name = "shares")
    private Map<String, Integer> stockPositions = new HashMap<>();


    // ===== Constructors =====
    public Account() {}

    public Account(User user, double initialCash) {
        this.user = user;
        this.cash = initialCash;
    }

    // ===== Getters & Setters =====
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public double getCash() {
        return cash;
    }

    public void setCash(double cash) {
        this.cash = cash;
    }

    public Map<String, Integer> getStockPositions() {
        return stockPositions;
    }

    public void setStockPositions(Map<String, Integer> stockPositions) {
        this.stockPositions = stockPositions;
    }
}
