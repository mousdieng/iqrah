package com.iqrah.quran.config;

import com.iqrah.quran.service.QuranImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final QuranImportService quranImportService;

    @Override
    public void run(String... args) throws Exception {
        quranImportService.importQuranIfMissing();
    }
}
