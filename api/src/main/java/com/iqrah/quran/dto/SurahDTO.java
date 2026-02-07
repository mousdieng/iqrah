package com.iqrah.quran.dto;

import com.iqrah.quran.entity.Ayah;
import com.iqrah.quran.entity.Surah;
import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class SurahDTO {
    private Integer number;
    private String name;
    private String englishName;
    private String englishNameTranslation;
    private Integer numberOfAyahs;
    private String revelationType;

    private List<Ayah> ayahs = new ArrayList<>();
    private Integer startingPage;
    private Integer endingPage;

    private static SurahDTO.SurahDTOBuilder fromSurahEntityDefault(Surah surah) {
        return SurahDTO.builder()
                .number(surah.getId())
                .name(surah.getName())
                .englishName(surah.getEnglishName())
                .englishNameTranslation(surah.getEnglishNameTranslation())
                .numberOfAyahs(surah.getNumberOfAyahs())
                .revelationType(surah.getRevelationType());

    }

    public static SurahDTO fromSurahEntity(Surah surah) {
        return SurahDTO.fromSurahEntityDefault(surah).build();
    }

    public static SurahDTO fromSurahEntity(Surah surah, List<Ayah> ayahs) {
        return SurahDTO.fromSurahEntityDefault(surah)
                .ayahs(ayahs)
                .build();
    }

    public static SurahDTO fromSurahEntity(Surah surah, Integer start, Integer end) {
        return SurahDTO.fromSurahEntityDefault(surah)
                .startingPage(start)
                .endingPage(end)
                .build();
    }

    public static SurahDTO fromSurahEntity(Surah surah, List<Ayah> ayahs, Integer start, Integer end) {
        return SurahDTO.fromSurahEntityDefault(surah)
                .ayahs(ayahs)
                .startingPage(start)
                .endingPage(end)
                .build();
    }

    public static List<SurahDTO> fromSurahEntity(List<Surah> surahs) {
        return surahs.stream()
                .map(SurahDTO::fromSurahEntity)
                .collect(Collectors.toList());
    }
}

