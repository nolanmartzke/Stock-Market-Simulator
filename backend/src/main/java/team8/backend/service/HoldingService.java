package team8.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team8.backend.entity.Account;
import team8.backend.entity.Holding;
import team8.backend.repository.HoldingRepository;

import java.util.List;

@Service
public class HoldingService {

    private final HoldingRepository holdingRepository;

    public HoldingService(HoldingRepository holdingRepository) {
        this.holdingRepository = holdingRepository;
    }

    public List<Holding> getHoldingsByAccount(Long accountId) {
        return holdingRepository.findByAccountId(accountId);
    }

    public Holding getHolding(Long accountId, String ticker) {
        return holdingRepository.findByAccountIdAndStockTicker(accountId, ticker);
    }

    @Transactional
    public Holding addOrUpdateHolding(Account account, String ticker, int shares, double purchasePrice) {
        Holding existing = holdingRepository.findByAccountIdAndStockTicker(account.getId(), ticker);

        if (existing != null) {
            // Update existing holding (recalculate average price)
            double totalCost = existing.getAveragePrice() * existing.getShares() + purchasePrice * shares;
            int newShareCount = existing.getShares() + shares;
            existing.setShares(newShareCount);
            existing.setAveragePrice(totalCost / newShareCount);
            return holdingRepository.save(existing);
        } else {
            // Create new holding
            Holding newHolding = new Holding(account, ticker, shares, purchasePrice);
            return holdingRepository.save(newHolding);
        }
    }

    @Transactional
    public void updateAfterSell(Account account, String ticker, int sharesToSell) {
        Holding existing = holdingRepository.findByAccountIdAndStockTicker(account.getId(), ticker);

        if (existing == null) {
            throw new IllegalArgumentException("Cannot sell shares — holding not found for " + ticker);
        }

        if (existing.getShares() < sharesToSell) {
            throw new IllegalArgumentException("Not enough shares to sell for " + ticker);
        }

        int remainingShares = existing.getShares() - sharesToSell;

        if (remainingShares == 0) {
            holdingRepository.delete(existing);
        } else {
            existing.setShares(remainingShares);
            holdingRepository.save(existing);
        }
    }

    public void deleteHolding(Long holdingId) {
        holdingRepository.deleteById(holdingId);
    }

    public Holding save(Holding holding) {
        return holdingRepository.save(holding);
    }
}
