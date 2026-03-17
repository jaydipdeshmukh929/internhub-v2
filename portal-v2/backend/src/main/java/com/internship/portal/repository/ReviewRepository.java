package com.internship.portal.repository;
import com.internship.portal.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCompanyName(String companyName);
    boolean existsByStudentEmailAndCompanyName(String email, String company);
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.companyName = :company")
    Double avgRatingByCompany(@Param("company") String company);
}
