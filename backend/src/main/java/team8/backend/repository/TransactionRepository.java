package team8.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import team8.backend.entity.Transaction;
import team8.backend.entity.Account;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountOrderByTimestampDesc(Account account);
}