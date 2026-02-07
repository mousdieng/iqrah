package com.iqrah.quran.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iqrah.quran.dto.AyahDataDTO;
import com.iqrah.quran.entity.Ayah;
import com.iqrah.quran.entity.Surah;
import com.iqrah.quran.repository.AyahRepository;
import com.iqrah.quran.repository.SurahRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuranImportService {

    private final SurahRepository surahRepository;
    private final AyahRepository ayahRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void importQuranIfMissing() throws Exception {

        if (ayahRepository.count() > 0) {
            System.out.println("Quran already imported. Skipping...");
            return;
        }

        InputStream inputStream = new ClassPathResource("quran.json").getInputStream();

        JsonNode root = objectMapper.readTree(inputStream);

        Map<Integer, Surah> surahCache = new HashMap<>();
        List<Ayah> ayahBatch = new ArrayList<>();

        for (JsonNode node : root) {
            JsonNode dataNode = node.get("data");
            if (dataNode == null || dataNode.isNull()) continue;

            AyahDataDTO dto = objectMapper.treeToValue(dataNode, AyahDataDTO.class);

            // 1) get or create surah (cached)
            Integer surahId = dto.getSurah().getNumber();

            Surah surah = surahCache.computeIfAbsent(surahId, id ->
                    surahRepository.findById(id).orElseGet(() ->
                            surahRepository.save(
                                    Surah.builder()
                                            .id(dto.getSurah().getNumber())
                                            .name(dto.getSurah().getName())
                                            .englishName(dto.getSurah().getEnglishName())
                                            .englishNameTranslation(dto.getSurah().getEnglishNameTranslation())
                                            .numberOfAyahs(dto.getSurah().getNumberOfAyahs())
                                            .revelationType(dto.getSurah().getRevelationType())
                                            .build()
                            )
                    )
            );

            // 2) create ayah (no need existsById because DB is empty)
            Ayah ayah = Ayah.builder()
                    .id(dto.getNumber())
                    .text(dto.getText())
                    .numberInSurah(dto.getNumberInSurah())
                    .juz(dto.getJuz())
                    .manzil(dto.getManzil())
                    .page(dto.getPage())
                    .ruku(dto.getRuku())
                    .hizbQuarter(dto.getHizbQuarter())
                    .sajda(parseSajda(dto.getSajda()))
                    .surah(surah)
                    .build();

            ayahBatch.add(ayah);
        }

        ayahRepository.saveAll(ayahBatch);

        System.out.println("Quran import finished. Ayahs inserted: " + ayahRepository.count());
    }

    private boolean parseSajda(JsonNode sajdaNode) {
        if (sajdaNode == null || sajdaNode.isNull()) return false;

        // if it's boolean: true/false
        if (sajdaNode.isBoolean()) return sajdaNode.asBoolean();

        // if it's object: { obligatory: true/false, ... }
        if (sajdaNode.isObject()) {
            JsonNode obligatory = sajdaNode.get("obligatory");
            if (obligatory != null && obligatory.isBoolean()) {
                return obligatory.asBoolean();
            }
            return true; // object exists => sajda exists
        }

        return false;
    }

}




//        List<AyahApiResponseDTO> list = objectMapper.readValue(
//                inputStream,
//                new TypeReference<List<AyahApiResponseDTO>>() {}
//        );
//
//        for (AyahApiResponseDTO item : list) {
//            AyahDataDTO dto = item.getData();










// Don't delete these

//@Service
//public class DataImportService {
//
//    private static final Logger logger = LoggerFactory.getLogger(DataImportService.class);
//
//    @Autowired
//    private AyaRepository ayaRepository;
//
//    @Autowired
//    private TranslationRepository translationRepository;
//
//    @Autowired
//    private AudioRepository audioRepository;
//
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    public void importQuranData() {
//        try {
//            // Import Arabic text first
//            importArabicText();
//
//            // Import translations
//            importTranslations("en_sahih", "english", "Sahih International");
//            importTranslations("en_pickthall", "english", "Pickthall");
//            importTranslations("fr_hamidullah", "french", "Muhammad Hamidullah");
//
//            // Import audio for popular reciters
//            importAudio("ar.alafasy", "Alafasy");
//            importAudio("ar.husary", "Husary");
//            importAudio("ar.mahermuaiqly", "Maher Al Muaiqly");
//            // Note: Additional reciters can be added later:
//            // importAudio("ar.abdurrahmaansudais", "Abdurrahmaan As-Sudais");
//
//            logger.info("Quran data import completed successfully");
//        } catch (Exception e) {
//            logger.error("Error importing Quran data", e);
//            throw new RuntimeException("Failed to import Quran data", e);
//        }
//    }
//
//    @Transactional
//    private void importArabicText() throws IOException {
//        logger.info("Importing Arabic Quran text...");
//
//        ClassPathResource resource = new ClassPathResource("quran-arabic.json");
//        try (InputStream inputStream = resource.getInputStream()) {
//            JsonNode rootNode = objectMapper.readTree(inputStream);
//
//            for (JsonNode surahNode : rootNode) {
//                int surahNumber = surahNode.get("id").asInt();
//                JsonNode versesNode = surahNode.get("verses");
//
//                if (versesNode != null && versesNode.isArray()) {
//                    for (JsonNode verseNode : versesNode) {
//                        int ayaNumber = verseNode.get("id").asInt();
//                        String arabicText = verseNode.get("text").asText();
//
//                        // Check if aya already exists
//                        Optional<Aya> existingAya = ayaRepository.findBySurahNumberAndAyaNumber(surahNumber, ayaNumber);
//
//                        if (existingAya.isEmpty()) {
//                            Aya aya = new Aya(surahNumber, ayaNumber, arabicText);
//                            ayaRepository.save(aya);
//                        }
//                    }
//                }
//            }
//        }
//
//        logger.info("Arabic text import completed");
//    }
//
//    @Transactional
//    private void importTranslations(String filePrefix, String language, String translatorName) {
//        logger.info("Importing {} translations by {}...", language, translatorName);
//
//        try {
//            // Import all 114 surahs
//            for (int surahNum = 1; surahNum <= 114; surahNum++) {
//                String fileName = String.format("translations/%s_%d.json", filePrefix, surahNum);
//
//                try {
//                    ClassPathResource resource = new ClassPathResource(fileName);
//                    if (!resource.exists()) {
//                        logger.warn("Translation file not found: {}", fileName);
//                        continue;
//                    }
//
//                    try (InputStream inputStream = resource.getInputStream()) {
//                        JsonNode rootNode = objectMapper.readTree(inputStream);
//                        JsonNode dataNode = rootNode.get("data");
//
//                        if (dataNode != null) {
//                            JsonNode ayahsNode = dataNode.get("ayahs");
//
//                            if (ayahsNode != null && ayahsNode.isArray()) {
//                                for (JsonNode ayahNode : ayahsNode) {
//                                    int surahNumber = dataNode.get("number").asInt();
//                                    int ayaNumber = ayahNode.get("numberInSurah").asInt();
//                                    String translationText = ayahNode.get("text").asText();
//
//                                    // Find the corresponding Aya
//                                    Optional<Aya> ayaOpt = ayaRepository.findBySurahNumberAndAyaNumber(surahNumber, ayaNumber);
//
//                                    if (ayaOpt.isPresent()) {
//                                        Aya aya = ayaOpt.get();
//
//                                        // Check if translation already exists
//                                        Optional<Translation> existingTranslation =
//                                            translationRepository.findByAyaIdAndLanguageAndTranslatorName(
//                                                aya.getId(), language, translatorName);
//
//                                        if (existingTranslation.isEmpty()) {
//                                            Translation translation = new Translation(aya, language, translatorName, translationText);
//                                            translationRepository.save(translation);
//                                        }
//                                    }
//                                }
//                            }
//                        }
//                    }
//                } catch (IOException e) {
//                    logger.error("Error reading translation file: {}", fileName, e);
//                }
//            }
//        } catch (Exception e) {
//            logger.error("Error importing {} translations", language, e);
//        }
//
//        logger.info("{} translations import completed", language);
//    }
//
//    @Transactional
//    private void importAudio(String reciterIdentifier, String reciterName) {
//        logger.info("Importing and downloading audio for reciter: {}...", reciterName);
//
//        RestTemplate restTemplate = new RestTemplate();
//        String reciterFolder = getReciterFolderName(reciterIdentifier);
//
//        try {
//            // Create directory for this reciter
//            Path audioDir = Paths.get("src/main/resources/audio/" + reciterFolder);
//            Files.createDirectories(audioDir);
//
//            // Import audio for all 114 surahs
//            for (int surahNum = 1; surahNum <= 114; surahNum++) {
//                try {
//                    String apiUrl = String.format("http://api.alquran.cloud/v1/surah/%d/%s", surahNum, reciterIdentifier);
//
//                    // Fetch the JSON response from the API
//                    String jsonResponse = restTemplate.getForObject(apiUrl, String.class);
//                    JsonNode rootNode = objectMapper.readTree(jsonResponse);
//                    JsonNode dataNode = rootNode.get("data");
//
//                    if (dataNode != null) {
//                        JsonNode ayahsNode = dataNode.get("ayahs");
//
//                        if (ayahsNode != null && ayahsNode.isArray()) {
//                            for (JsonNode ayahNode : ayahsNode) {
//                                int surahNumber = dataNode.get("number").asInt();
//                                int ayaNumber = ayahNode.get("numberInSurah").asInt();
//                                String audioUrl = ayahNode.get("audio").asText();
//
//                                // Find the corresponding Aya
//                                Optional<Aya> ayaOpt = ayaRepository.findBySurahNumberAndAyaNumber(surahNumber, ayaNumber);
//
//                                if (ayaOpt.isPresent()) {
//                                    Aya aya = ayaOpt.get();
//
//                                    // Check if audio already exists for this aya and reciter
//                                    Optional<Audio> existingAudio = audioRepository.findByAyaAndReciterName(aya, reciterName);
//
//                                    if (existingAudio.isEmpty()) {
//                                        // Download the MP3 file
//                                        String fileName = String.format("%d_%d.mp3", surahNumber, ayaNumber);
//                                        Path localFilePath = audioDir.resolve(fileName);
//
//                                        if (!Files.exists(localFilePath)) {
//                                            downloadAudioFile(audioUrl, localFilePath);
//                                            logger.debug("Downloaded audio for Surah {} Ayah {} - {}", surahNumber, ayaNumber, reciterName);
//                                        }
//
//                                        // Save to database with local path
//                                        Audio audio = new Audio();
//                                        audio.setAya(aya);
//                                        audio.setReciterName(reciterName);
//                                        audio.setUrl(audioUrl); // Keep original URL
//                                        audio.setLocalPath("audio/" + reciterFolder + "/" + fileName); // Set local path
//                                        audioRepository.save(audio);
//                                    }
//                                }
//                            }
//                        }
//                    }
//
//                    logger.info("Completed audio download for Surah {} - {}", surahNum, reciterName);
//
//                    // Small delay to be respectful to the API
//                    Thread.sleep(100);
//
//                } catch (Exception e) {
//                    logger.error("Error processing audio for surah {} with reciter {}", surahNum, reciterName, e);
//                }
//            }
//
//            logger.info("Audio import and download completed for reciter: {}", reciterName);
//        } catch (Exception e) {
//            logger.error("Error importing audio for reciter: {}", reciterName, e);
//        }
//    }
//
//    private String getReciterFolderName(String reciterIdentifier) {
//        switch (reciterIdentifier) {
//            case "ar.alafasy":
//                return "alafasy";
//            case "ar.husary":
//                return "husary";
//            case "ar.mahermuaiqly":
//                return "maher_al_muaiqly";
//            case "ar.abdurrahmaansudais":
//                return "sudais";
//            default:
//                return reciterIdentifier.replace("ar.", "");
//        }
//    }
//
//    private void downloadAudioFile(String audioUrl, Path localPath) throws IOException {
//        try (InputStream inputStream = new URL(audioUrl).openStream();
//             FileOutputStream outputStream = new FileOutputStream(localPath.toFile())) {
//
//            byte[] buffer = new byte[8192];
//            int bytesRead;
//            while ((bytesRead = inputStream.read(buffer)) != -1) {
//                outputStream.write(buffer, 0, bytesRead);
//            }
//        }
//    }
//
//    public long getAyaCount() {
//        return ayaRepository.count();
//    }
//
//    public long getTranslationCount() {
//        return translationRepository.count();
//    }
//
//    public void importHusaryAudio() {
//        try {
//            importAudio("ar.husary", "Husary");
//            logger.info("Husary audio import completed successfully");
//        } catch (Exception e) {
//            logger.error("Error importing Husary audio", e);
//            throw new RuntimeException("Failed to import Husary audio", e);
//        }
//    }
//
//    public void importMaherAlMuaiqlyAudio() {
//        try {
//            importAudio("ar.mahermuaiqly", "Maher Al Muaiqly");
//            logger.info("Maher Al Muaiqly audio import completed successfully");
//        } catch (Exception e) {
//            logger.error("Error importing Maher Al Muaiqly audio", e);
//            throw new RuntimeException("Failed to import Maher Al Muaiqly audio", e);
//        }
//    }
//
//    public void importSaadAlGhamdiAudio() {
//        logger.warn("Saad Al Ghamdi is not available through the AlQuran.cloud API");
//        logger.info("Please manually download audio files for Saad Al Ghamdi and use importCustomAudio method");
//        // TODO: Implement custom audio import from local files
//        throw new RuntimeException("Saad Al Ghamdi audio not available through API. Manual import required.");
//    }
//
//    public void importBadrAlTurkiAudio() {
//        logger.warn("Badr Al Turki is not available through the AlQuran.cloud API");
//        logger.info("Please manually download audio files for Badr Al Turki and use importCustomAudio method");
//        // TODO: Implement custom audio import from local files
//        throw new RuntimeException("Badr Al Turki audio not available through API. Manual import required.");
//    }
//
//    public long getAudioCount() {
//        return audioRepository.count();
//    }
//}