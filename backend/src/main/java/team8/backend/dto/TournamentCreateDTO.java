package team8.backend.dto;

import java.time.LocalDateTime;

public class TournamentCreateDTO {
    private String name;
    private Integer maxParticipants;
    private Double initialCash;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String image;

    // Getters & Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public Double getInitialCash() { return initialCash; }
    public void setInitialCash(Double initialCash) { this.initialCash = initialCash; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}