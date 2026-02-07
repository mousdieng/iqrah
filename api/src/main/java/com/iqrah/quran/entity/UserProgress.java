//package com.iqrah.quran.entity;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "user_progress")
//public class UserProgress {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "aya_id", nullable = false)
//    private Aya aya;
//
//    @Column(name = "user_id")
//    private String userId;
//
//    @Column(name = "memorized", nullable = false)
//    private Boolean memorized = false;
//
//    @Column(name = "last_reviewed")
//    private LocalDateTime lastReviewed;
//
//    @Column(name = "review_count", nullable = false)
//    private Integer reviewCount = 0;
//
//    // Constructors
//    public UserProgress() {}
//
//    public UserProgress(Aya aya, String userId, Boolean memorized) {
//        this.aya = aya;
//        this.userId = userId;
//        this.memorized = memorized;
//        this.lastReviewed = LocalDateTime.now();
//    }
//
//    // Getters and Setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public Aya getAya() { return aya; }
//    public void setAya(Aya aya) { this.aya = aya; }
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