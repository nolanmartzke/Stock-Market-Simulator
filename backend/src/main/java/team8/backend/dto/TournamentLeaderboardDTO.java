package team8.backend.dto;

public class TournamentLeaderboardDTO {
private String accountName;
private double cash;
private double totalHoldingValue;

public TournamentLeaderboardDTO() {}

public TournamentLeaderboardDTO(String accountName, double cash, double totalHoldingValue) {
    this.accountName = accountName;
    this.cash = cash;
    this.totalHoldingValue = totalHoldingValue;
}

// Getters & setters
public String getAccountName() { return accountName; }
public double getCash() { return cash; }
public double getTotalHoldingValue() { return totalHoldingValue; }

public void setAccountName(String accountName) { this.accountName = accountName; }
public void setCash(double cash) { this.cash = cash; }
public void setTotalHoldingValue(double totalHoldingValue) { this.totalHoldingValue = totalHoldingValue; }

}