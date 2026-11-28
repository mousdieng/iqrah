package com.iqrah.quran.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A reciter as shown in the player: id used in audio URLs, display name, and "local" or "remote" */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReciterDTO {
    private String id;
    private String name;
    private String source;
}
