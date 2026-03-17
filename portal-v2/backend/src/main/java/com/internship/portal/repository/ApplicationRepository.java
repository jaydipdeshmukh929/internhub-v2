package com.internship.portal.repository;

import com.internship.portal.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentEmail(String email);
    List<Application> findByInternshipId(Long internshipId);
    boolean existsByStudentEmailAndInternshipId(String email, Long internshipId);
    long countByStatus(Application.Status status);

    // Analytics: applications per day
    @Query("SELECT FUNCTION('DATE', a.appliedAt), COUNT(a) FROM Application a GROUP BY FUNCTION('DATE', a.appliedAt) ORDER BY FUNCTION('DATE', a.appliedAt) DESC")
    List<Object[]> applicationsPerDay();

    // Analytics: applications per month (heatmap)
    @Query("SELECT FUNCTION('MONTH', a.appliedAt), FUNCTION('YEAR', a.appliedAt), COUNT(a) FROM Application a GROUP BY FUNCTION('YEAR', a.appliedAt), FUNCTION('MONTH', a.appliedAt) ORDER BY FUNCTION('YEAR', a.appliedAt), FUNCTION('MONTH', a.appliedAt)")
    List<Object[]> applicationsPerMonth();

    // Student analytics
    List<Application> findByStudentEmailAndStatus(String email, Application.Status status);

    // Company wise
    @Query("SELECT a.companyName, COUNT(a) FROM Application a GROUP BY a.companyName ORDER BY COUNT(a) DESC")
    List<Object[]> countByCompany();
}
