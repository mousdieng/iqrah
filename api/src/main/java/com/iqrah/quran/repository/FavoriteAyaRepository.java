//package com.iqrah.quran.repository;
//
//import com.iqrah.quran.entity.FavoriteAya;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface FavoriteAyaRepository extends JpaRepository<FavoriteAya, Long> {
//
//    List<FavoriteAya> findByUserIdOrderByCreatedAtDesc(String userId);
//
//    Optional<FavoriteAya> findByAyaIdAndUserId(Long ayaId, String userId);
//
//    boolean existsByAyaIdAndUserId(Long ayaId, String userId);
//
//    void deleteByAyaIdAndUserId(Long ayaId, String userId);
//}