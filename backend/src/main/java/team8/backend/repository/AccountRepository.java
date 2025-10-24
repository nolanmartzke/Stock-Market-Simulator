package team8.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team8.backend.entity.Account;
import team8.backend.entity.User;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    // Find all accounts for a given user
    List<Account> findByUser(User user);
}
