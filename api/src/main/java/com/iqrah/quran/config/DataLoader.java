package com.iqrah.quran.config;

import com.iqrah.quran.service.QuranImportService;
import com.iqrah.quran.service.TranslationImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final QuranImportService quranImportService;
    private final TranslationImportService translationImportService;

    @Override
    public void run(String... args) throws Exception {
        quranImportService.importQuranIfMissing();
        translationImportService.importTranslationsIfMissing();
    }
}
