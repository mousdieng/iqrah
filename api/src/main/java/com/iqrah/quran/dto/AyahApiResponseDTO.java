package com.iqrah.quran.dto;

import lombok.Data;

@Data
public class AyahApiResponseDTO {
    private int code;
    private String status;
    private AyahDataDTO data;
}

