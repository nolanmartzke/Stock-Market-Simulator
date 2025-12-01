package team8.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team8.backend.entity.Account;
import team8.backend.entity.Holding;
import team8.backend.repository.HoldingRepository;
import team8.backend.dto.HoldingDTO;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HoldingService {

    private final HoldingRepository holdingRepository;

    public HoldingService(HoldingRepository holdingRepository) {
        this.holdingRepository = holdingRepository;
    }

    // Get holdings for an account
    public List<HoldingDTO> getHoldingsByAccount(Long accountId) {
        return holdingRepository.findByAccountId(accountId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get a single holding
    public HoldingDTO getHolding(Long accountId, String ticker) {
        Holding h = holdingRepository.findByAccountIdAndStockTicker(accountId, ticker);
        return h != null ? toDTO(h) : null;
    }

    // Add or update a holding (Buy)
    @Transactional
    public HoldingDTO addOrUpdateHolding(Account account, String ticker, double shares, double purchasePrice) {
        Holding existing = holdingRepository.findByAccountIdAndStockTicker(account.getId(), ticker);

        Holding saved;
        if (existing != null) {
            // Update existing holding (recalculate average price)
            double totalCost = existing.getAveragePrice() * existing.getShares() + purchasePrice * shares;
            double newShareCount = existing.getShares() + shares;
            existing.setShares(newShareCount);
            existing.setAveragePrice(totalCost / newShareCount);
            saved = holdingRepository.save(existing);
        } else {
            // Create new holding
            Holding newHolding = new Holding(account, ticker, shares, purchasePrice);
            saved = holdingRepository.save(newHolding);
        }

        return toDTO(saved);
    }

    // Update after a sell transaction
    @Transactional
    public void updateAfterSell(Account account, String ticker, double sharesToSell) {
        Holding existing = holdingRepository.findByAccountIdAndStockTicker(account.getId(), ticker);

        if (existing == null) {
            throw new IllegalArgumentException("Cannot sell shares — holding not found for " + ticker);
        }

        if (existing.getShares() < sharesToSell) {
            throw new IllegalArgumentException("Not enough shares to sell for " + ticker);
        }

        double remainingShares = existing.getShares() - sharesToSell;

        if (remainingShares == 0) {
            account.getHoldings().remove(existing);
        } else {
            existing.setShares(remainingShares);
            holdingRepository.save(existing);
        }
    }

    // Delete a holding
    public void deleteHolding(Long holdingId) {
        holdingRepository.deleteById(holdingId);
    }

    // Save a holding (if needed internally)
    public HoldingDTO save(Holding holding) {
        Holding saved = holdingRepository.save(holding);
        return toDTO(saved);
    }

    // Helper to convert entity -> DTO
    private HoldingDTO toDTO(Holding h) {
    return new HoldingDTO(
        h.getId(),
        h.getStockTicker(),
        h.getShares(),
        h.getAveragePrice(),
        h.getAccount() != null ? h.getAccount().getId() : null
    );
}
}
