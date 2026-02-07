package com.iqrah.quran.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.iqrah.quran.entity.Ayah;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AyahDataDTO {
    private Integer number;
    private String text;

    private SurahDTO surah;

    private Integer numberInSurah;
    private Integer juz;
    private Integer manzil;
    private Integer page;
    private Integer ruku;
    private Integer hizbQuarter;
    private JsonNode sajda;

//    public static AyahDataDTO fromAyah(Ayah ayah) {
//        if (ayah == null) return null;
//
//        return AyahDataDTO.builder()
//                .number(ayah.getNumber())
//                .text(ayah.getText())
//                .surah(SurahDTO.fromSurah(ayah.getSurah()))
//                .numberInSurah(ayah.getNumberInSurah())
//                .juz(ayah.getJuz())
//                .manzil(ayah.getManzil())
//                .page(ayah.getPage())
//                .ruku(ayah.getRuku())
//                .hizbQuarter(ayah.getHizbQuarter())
//                .sajda(ayah.getSajda())
//                .build();
//    }
}
