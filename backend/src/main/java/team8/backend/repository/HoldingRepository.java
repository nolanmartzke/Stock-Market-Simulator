package team8.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import team8.backend.entity.Holding;
import java.util.List;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {
    List<Holding> findByAccountId(Long accountId);
    Holding findByAccountIdAndStockTicker(Long accountId, String stockTicker);
}