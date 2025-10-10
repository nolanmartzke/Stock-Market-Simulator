package team8.backend.repository;

import team8.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    // do not need any additional code to function, majority of the repo interface
    // we will use is just pulled from JpaRepository

    // will add custom functions that run SQL prompts here

    boolean existsByEmail(String email);
}
