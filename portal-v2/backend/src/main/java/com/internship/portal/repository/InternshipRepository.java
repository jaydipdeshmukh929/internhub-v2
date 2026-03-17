package com.internship.portal.repository;

import com.internship.portal.model.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {

    List<Internship> findByStatus(Internship.Status status);
    List<Internship> findByCategory(String category);

    // Advanced search with all filters
    @Query("SELECT i FROM Internship i WHERE i.status = 'ACTIVE' AND " +
            "(:keyword IS NULL OR LOWER(i.companyName) LIKE LOWER(CONCAT('%',:keyword,'%')) OR LOWER(i.role) LIKE LOWER(CONCAT('%',:keyword,'%'))) AND " +
            "(:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%',:location,'%'))) AND " +
            "(:category IS NULL OR i.category = :category) AND " +
            "(:minStipend IS NULL OR i.stipend >= :minStipend) AND " +
            "(:maxStipend IS NULL OR i.stipend <= :maxStipend) AND " +
            "(:remote IS NULL OR i.remote = :remote) AND " +
            "(:type IS NULL OR i.type = :type)")
    List<Internship> advancedSearch(
            @Param("keyword")    String keyword,
            @Param("location")   String location,
            @Param("category")   String category,
            @Param("minStipend") Double minStipend,
            @Param("maxStipend") Double maxStipend,
            @Param("remote")     Boolean remote,
            @Param("type")       String type);

    // Trending — most viewed in last 7 days (approximated by viewCount + recency)
    @Query("SELECT i FROM Internship i WHERE i.status = 'ACTIVE' AND i.postedAt >= :since ORDER BY i.viewCount DESC")
    List<Internship> findTrending(@Param("since") LocalDateTime since);

    // Similar internships — same category, exclude current
    @Query("SELECT i FROM Internship i WHERE i.status = 'ACTIVE' AND i.category = :category AND i.id <> :excludeId ORDER BY i.applicationCount DESC")
    List<Internship> findSimilar(@Param("category") String category, @Param("excludeId") Long excludeId);

    // Latest 5
    List<Internship> findTop5ByStatusOrderByPostedAtDesc(Internship.Status status);

    // Top 5 trending (most viewed)
    List<Internship> findTop5ByStatusOrderByViewCountDesc(Internship.Status status);

    // Analytics
    @Query("SELECT i.companyName, COUNT(a) FROM Internship i LEFT JOIN Application a ON a.internship.id = i.id GROUP BY i.companyName ORDER BY COUNT(a) DESC")
    List<Object[]> companyWiseApplicationCount();
}
