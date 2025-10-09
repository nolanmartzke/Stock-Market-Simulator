package team8.backend.repository;
import team8.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // does not need any additional code to function

    // will add custom functions that run SQL prompts here
}
