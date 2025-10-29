package team8.backend.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

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

    // One account can have many holdings
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Holding> holdings = new ArrayList<>();


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

    public List<Holding> getHoldings() {
        return holdings;
    }

    public void setHoldings(List<Holding> holdings) {
        this.holdings = holdings;
    }

    // Helper methods
    public void addHolding(Holding holding) {
        holdings.add(holding);
        holding.setAccount(this);
    }

    public void removeHolding(Holding holding) {
        holdings.remove(holding);
        holding.setAccount(null);
    }
}
