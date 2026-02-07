//package com.iqrah.quran.entity;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "favorite_aya")
//public class FavoriteAya {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "aya_id", nullable = false)
//    private Aya aya;
//
//    @Column(name = "user_id", nullable = false)
//    private String userId;
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt;
//
//    // Constructors
//    public FavoriteAya() {
//        this.createdAt = LocalDateTime.now();
//    }
//
//    public FavoriteAya(Aya aya, String userId) {
//        this.aya = aya;
//        this.userId = userId;
//        this.createdAt = LocalDateTime.now();
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
//    public LocalDateTime getCreatedAt() { return createdAt; }
//    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
//}