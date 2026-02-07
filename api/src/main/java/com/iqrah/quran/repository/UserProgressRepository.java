//package com.iqrah.quran.repository;
//
//import com.iqrah.quran.entity.UserProgress;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
//
//    Optional<UserProgress> findByAyaIdAndUserId(Long ayaId, String userId);
//
//    List<UserProgress> findByUserId(String userId);
//
//    List<UserProgress> findByUserIdAndMemorized(String userId, Boolean memorized);
//
//    @Query("SELECT up FROM UserProgress up WHERE up.userId = :userId AND up.lastReviewed < :date ORDER BY up.lastReviewed ASC")
//    List<UserProgress> findUserProgressForReview(@Param("userId") String userId, @Param("date") LocalDateTime date);
//
//    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.userId = :userId AND up.memorized = true")
//    Long countMemorizedByUserId(@Param("userId") String userId);
//
//    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.userId = :userId")
//    Long countTotalProgressByUserId(@Param("userId") String userId);
//}