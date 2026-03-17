package com.internship.portal.repository;

import com.internship.portal.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByStudentEmail(String email);
    boolean existsByStudentEmailAndBadgeName(String email, String name);
}
