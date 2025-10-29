package team8.backend.dto;

import team8.backend.entity.Holding;

public class HoldingDTO {
    private Long id;
    private String stockTicker;
    private int shares;
    private double averagePrice;
    private Long accountId; // just the account ID to avoid recursion

    public HoldingDTO() {}

    public HoldingDTO(Long id, String stockTicker, int shares, double averagePrice, Long accountId) {
        this.id = id;
        this.stockTicker = stockTicker;
        this.shares = shares;
        this.averagePrice = averagePrice;
        this.accountId = accountId;
    }

    // ===== fromEntity method =====
    public static HoldingDTO fromEntity(Holding h) {
        return new HoldingDTO(
            h.getId(),
            h.getStockTicker(),
            h.getShares(),
            h.getAveragePrice(),
            h.getAccount() != null ? h.getAccount().getId() : null
        );
    }

    // ===== getters & setters =====
    public Long getId() { return id; }
    public String getStockTicker() { return stockTicker; }
    public int getShares() { return shares; }
    public double getAveragePrice() { return averagePrice; }
    public Long getAccountId() { return accountId; }
    
    public void setId(Long id) { this.id = id; }
    public void setStockTicker(String stockTicker) { this.stockTicker = stockTicker; }
    public void setShares(int shares) { this.shares = shares; }
    public void setAveragePrice(double averagePrice) { this.averagePrice = averagePrice; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
}
