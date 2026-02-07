//package com.iqrah.quran.entity;
//
//import jakarta.persistence.*;
//
//@Entity
//@Table(name = "translation")
//public class Translation {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "aya_id", nullable = false)
//    private Aya aya;
//
//    @Column(name = "language", nullable = false)
//    private String language;
//
//    @Column(name = "translator_name", nullable = false)
//    private String translatorName;
//
//    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
//    private String text;
//
//    // Constructors
//    public Translation() {}
//
//    public Translation(Aya aya, String language, String translatorName, String text) {
//        this.aya = aya;
//        this.language = language;
//        this.translatorName = translatorName;
//        this.text = text;
//    }
//
//    // Getters and Setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public Aya getAya() { return aya; }
//    public void setAya(Aya aya) { this.aya = aya; }
//
//    public String getLanguage() { return language; }
//    public void setLanguage(String language) { this.language = language; }
//
//    public String getTranslatorName() { return translatorName; }
//    public void setTranslatorName(String translatorName) { this.translatorName = translatorName; }
//
//    public String getText() { return text; }
//    public void setText(String text) { this.text = text; }
//}