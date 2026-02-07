-- Sample data for testing

-- Insert sample Ayas (Al-Fatiha)
INSERT INTO aya (surah_number, aya_number, arabic_text) VALUES
(1, 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'),
(1, 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'),
(1, 3, 'الرَّحْمَٰنِ الرَّحِيمِ'),
(1, 4, 'مَالِكِ يَوْمِ الدِّينِ'),
(1, 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ'),
(1, 6, 'اهْدِنَا الصِّراطَ الْمُسْتَقِيمَ'),
(1, 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ');

-- Insert sample translations (French)
INSERT INTO translation (aya_id, language, translator_name, text) VALUES
(1, 'french', 'Muhammad Hamidullah', 'Au nom d''Allah, le Tout Miséricordieux, le Très Miséricordieux.'),
(2, 'french', 'Muhammad Hamidullah', 'Louange à Allah, Seigneur de l''univers.'),
(3, 'french', 'Muhammad Hamidullah', 'Le Tout Miséricordieux, le Très Miséricordieux,'),
(4, 'french', 'Muhammad Hamidullah', 'Maître du Jour de la rétribution.'),
(5, 'french', 'Muhammad Hamidullah', 'C''est Toi [Seul] que nous adorons, et c''est Toi [Seul] dont nous implorons secours.'),
(6, 'french', 'Muhammad Hamidullah', 'Guide-nous dans le droit chemin,'),
(7, 'french', 'Muhammad Hamidullah', 'le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.');

-- Insert sample translations (English)
INSERT INTO translation (aya_id, language, translator_name, text) VALUES
(1, 'english', 'Sahih International', 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'),
(2, 'english', 'Sahih International', '[All] praise is [due] to Allah, Lord of the worlds -'),
(3, 'english', 'Sahih International', 'The Entirely Merciful, the Especially Merciful,'),
(4, 'english', 'Sahih International', 'Sovereign of the Day of Recompense.'),
(5, 'english', 'Sahih International', 'It is You we worship and You we ask for help.'),
(6, 'english', 'Sahih International', 'Guide us to the straight path -'),
(7, 'english', 'Sahih International', 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.');

-- Insert sample audio files
INSERT INTO audio (aya_id, reciter_name, url, local_path) VALUES
(1, 'Abdul Basit', 'https://example.com/audio/abdul_basit/001_001.mp3', 'resources/audio/abdul_basit/001_001.mp3'),
(2, 'Abdul Basit', 'https://example.com/audio/abdul_basit/001_002.mp3', 'resources/audio/abdul_basit/001_002.mp3'),
(3, 'Abdul Basit', 'https://example.com/audio/abdul_basit/001_003.mp3', 'resources/audio/abdul_basit/001_003.mp3'),
(4, 'Abdul Basit', 'https://example.com/audio/abdul_basit/001_004.mp3', 'resources/audio/abdul_basit/001_004.mp3'),
(5, 'Abdul Basit', 'https://example.com/audio/abdul_basit/001_005.mp3', 'resources/audio/abdul_basit/001_005.mp3'),
(6, 'Abdul Basit', 'https://example.com/audio/abdul_basit/001_006.mp3', 'resources/audio/abdul_basit/001_006.mp3'),
(7, 'Abdul Basit', 'https://example.com/audio/abdul_basit/001_007.mp3', 'resources/audio/abdul_basit/001_007.mp3');

-- Insert sample audio files for different reciter
INSERT INTO audio (aya_id, reciter_name, url, local_path) VALUES
(1, 'Mishary Al-Afasy', 'https://example.com/audio/mishary/001_001.mp3', 'resources/audio/mishary/001_001.mp3'),
(2, 'Mishary Al-Afasy', 'https://example.com/audio/mishary/001_002.mp3', 'resources/audio/mishary/001_002.mp3'),
(3, 'Mishary Al-Afasy', 'https://example.com/audio/mishary/001_003.mp3', 'resources/audio/mishary/001_003.mp3'),
(4, 'Mishary Al-Afasy', 'https://example.com/audio/mishary/001_004.mp3', 'resources/audio/mishary/001_004.mp3'),
(5, 'Mishary Al-Afasy', 'https://example.com/audio/mishary/001_005.mp3', 'resources/audio/mishary/001_005.mp3'),
(6, 'Mishary Al-Afasy', 'https://example.com/audio/mishary/001_006.mp3', 'resources/audio/mishary/001_006.mp3'),
(7, 'Mishary Al-Afasy', 'https://example.com/audio/mishary/001_007.mp3', 'resources/audio/mishary/001_007.mp3');

-- Insert sample Juz
INSERT INTO juz (number, name) VALUES
(1, 'Alif Lam Meem'),
(2, 'Sayaqool'),
(30, 'Amma');

-- Create directories for audio files
-- This would be handled by the application or deployment scripts