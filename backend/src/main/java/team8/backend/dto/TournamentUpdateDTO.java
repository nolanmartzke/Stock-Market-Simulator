package team8.backend.dto;

import java.time.LocalDateTime;

public class TournamentUpdateDTO {
    private String name;
    private Integer maxParticipants;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public TournamentUpdateDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
}