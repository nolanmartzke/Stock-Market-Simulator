package team8.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tournaments")
public class Tournament {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false, unique = true)
private String name;

@Column(nullable = false)
private int maxParticipants;

@Column(nullable = false)
private double initialCash; // cash given to accounts created for this tournament

@Column(nullable = false)
private LocalDateTime startDate;

@Column(nullable = false)
private LocalDateTime endDate;

@Column(nullable = true, length = 512)
private String image;

@OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Account> accounts = new ArrayList<>();

// Constructors
public Tournament() {}

public Tournament(String name, int maxParticipants, double initialCash, LocalDateTime startDate, LocalDateTime endDate) {
    this.name = name;
    this.maxParticipants = maxParticipants;
    this.initialCash = initialCash;
    this.startDate = startDate;
    this.endDate = endDate;
}

public String getImage() { return image; }
public void setImage(String image) { this.image = image; }

// Getters & setters
public Long getId() { return id; }
public String getName() { return name; }
public int getMaxParticipants() { return maxParticipants; }
public LocalDateTime getStartDate() { return startDate; }
public LocalDateTime getEndDate() { return endDate; }
public List<Account> getAccounts() { return accounts; }
public double getInitialCash() { return initialCash; }

public void setName(String name) { this.name = name; }
public void setMaxParticipants(int maxParticipants) { this.maxParticipants = maxParticipants; }
public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
public void setAccounts(List<Account> accounts) { this.accounts = accounts; }
public void setInitialCash(double initialCash) { this.initialCash = initialCash; }

public int getParticipantCount() { return accounts.size(); }

public String getStatus() {
    LocalDateTime now = LocalDateTime.now();
    if (now.isBefore(startDate)) return "UPCOMING";
    if (now.isAfter(endDate)) return "COMPLETED";
    return "ACTIVE";
}

public void addAccount(Account account) {
    accounts.add(account);
    account.setTournament(this);
}

}
