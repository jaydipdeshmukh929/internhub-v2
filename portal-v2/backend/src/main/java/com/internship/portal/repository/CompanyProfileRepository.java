package com.internship.portal.repository;

import com.internship.portal.model.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {
    Optional<CompanyProfile> findByCompanyName(String companyName);
    List<CompanyProfile> findByCreatedByEmail(String email);
    boolean existsByCompanyName(String companyName);
}
