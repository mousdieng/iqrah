package com.iqrah.quran.dto;

public class RepeatRequestDTO {
    private Integer count;
    private String reciter;
    private Integer pauseDuration; // in seconds

    public RepeatRequestDTO() {}

    public RepeatRequestDTO(Integer count, String reciter, Integer pauseDuration) {
        this.count = count;
        this.reciter = reciter;
        this.pauseDuration = pauseDuration;
    }

    // Getters and Setters
    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }

    public String getReciter() { return reciter; }
    public void setReciter(String reciter) { this.reciter = reciter; }

    public Integer getPauseDuration() { return pauseDuration; }
    public void setPauseDuration(Integer pauseDuration) { this.pauseDuration = pauseDuration; }
}