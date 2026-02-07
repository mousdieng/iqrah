package com.iqrah.quran.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AudioDTO {
    private Long id;
    private AudioType audioType;
    private String authorName;
    private String url;
    private String localPath;
}