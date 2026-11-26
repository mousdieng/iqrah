package com.iqrah.quran.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Data
@Table(name = "word_meanings")
public class WordMeaning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ayah_id", nullable = false)
    private Integer ayahId;

    @Column(name = "word_index", nullable = false)
    private Integer wordIndex;

    @Column(name = "arabic_word", nullable = false)
    private String arabicWord;

    @Column(name = "grammar_fr", columnDefinition = "TEXT")
    private String grammarFr;

    @Column(name = "meaning_fr", columnDefinition = "TEXT")
    private String meaningFr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ayah_id", insertable = false, updatable = false)
    @JsonIgnore
    private Ayah ayah;
}
