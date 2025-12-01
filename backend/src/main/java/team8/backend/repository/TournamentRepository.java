package team8.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team8.backend.entity.Tournament;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
}
