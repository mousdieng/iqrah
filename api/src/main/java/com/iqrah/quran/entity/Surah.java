package com.iqrah.quran.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "surahs")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Surah {

    @Id
    private Integer id; // 1..114

    private String name;
    private String englishName;
    private String englishNameTranslation;
    private Integer numberOfAyahs;
    private String revelationType;

    @OneToMany(mappedBy = "surah", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    @JsonIgnore
    private List<Ayah> ayahs = new ArrayList<>();
}

