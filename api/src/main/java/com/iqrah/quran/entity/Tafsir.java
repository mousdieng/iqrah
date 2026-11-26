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
        name = "tafsirs",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"ayah_id", "language"})
        }
)
public class Tafsir {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ayah_id", nullable = false)
    private Integer ayahId;

    @Column(name = "language", nullable = false, length = 5)
    private String language;

    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "references_list", columnDefinition = "TEXT")
    private String referencesList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ayah_id", insertable = false, updatable = false)
    @JsonIgnore
    private Ayah ayah;
}
