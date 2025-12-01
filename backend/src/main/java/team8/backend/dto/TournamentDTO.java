package team8.backend.dto;

import team8.backend.entity.Tournament;
import java.time.LocalDateTime;

public class TournamentDTO {
private Long id;
private String name;
private int maxParticipants;
private int currentParticipants;
private LocalDateTime startDate;
private LocalDateTime endDate;
private String status;

public TournamentDTO() {}

public static TournamentDTO fromEntity(Tournament t) {
    TournamentDTO dto = new TournamentDTO();
    dto.id = t.getId();
    dto.name = t.getName();
    dto.maxParticipants = t.getMaxParticipants();
    dto.currentParticipants = t.getParticipantCount();
    dto.startDate = t.getStartDate();
    dto.endDate = t.getEndDate();
    dto.status = t.getStatus();
    return dto;
}

// Getters & setters
public Long getId() { return id; }
public String getName() { return name; }
public int getMaxParticipants() { return maxParticipants; }
public int getCurrentParticipants() { return currentParticipants; }
public LocalDateTime getStartDate() { return startDate; }
public LocalDateTime getEndDate() { return endDate; }
public String getStatus() { return status; }

public void setId(Long id) { this.id = id; }
public void setName(String name) { this.name = name; }
public void setMaxParticipants(int maxParticipants) { this.maxParticipants = maxParticipants; }
public void setCurrentParticipants(int currentParticipants) { this.currentParticipants = currentParticipants; }
public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
public void setStatus(String status) { this.status = status; }

}
