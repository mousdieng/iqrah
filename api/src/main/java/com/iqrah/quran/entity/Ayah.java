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
@Table(
        name = "ayahs",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"surah_id", "numberInSurah"})
        }
)
public class Ayah {

    @Id
    private Integer id; // global ayah number (1..6236)

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    private Integer numberInSurah;
    private Integer juz;
    private Integer manzil;
    private Integer page;
    private Integer ruku;
    private Integer hizbQuarter;
    private Boolean sajda;

    // optional: keep edition identifier only (no extra props)
    private String editionIdentifier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "surah_id", nullable = false)
    @JsonIgnore
    private Surah surah;
}
