//package com.iqrah.quran.dto;
//
//import java.time.LocalDateTime;
//
//public class UserProgressDTO {
//    private Long id;
//    private AyaDTO aya;
//    private String userId;
//    private Boolean memorized;
//    private LocalDateTime lastReviewed;
//    private Integer reviewCount;
//
//    public UserProgressDTO() {}
//
//    public UserProgressDTO(Long id, AyaDTO aya, String userId, Boolean memorized,
//                          LocalDateTime lastReviewed, Integer reviewCount) {
//        this.id = id;
//        this.aya = aya;
//        this.userId = userId;
//        this.memorized = memorized;
//        this.lastReviewed = lastReviewed;
//        this.reviewCount = reviewCount;
//    }
//
//    // Getters and Setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public AyaDTO getAya() { return aya; }
//    public void setAya(AyaDTO aya) { this.aya = aya; }
//
//    public String getUserId() { return userId; }
//    public void setUserId(String userId) { this.userId = userId; }
//
//    public Boolean getMemorized() { return memorized; }
//    public void setMemorized(Boolean memorized) { this.memorized = memorized; }
//
//    public LocalDateTime getLastReviewed() { return lastReviewed; }
//    public void setLastReviewed(LocalDateTime lastReviewed) { this.lastReviewed = lastReviewed; }
//
//    public Integer getReviewCount() { return reviewCount; }
//    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
//}