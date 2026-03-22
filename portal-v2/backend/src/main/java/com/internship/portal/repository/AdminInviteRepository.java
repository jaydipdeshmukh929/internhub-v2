package com.internship.portal.repository;

import com.internship.portal.model.AdminInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AdminInviteRepository extends JpaRepository<AdminInvite, Long> {
    Optional<AdminInvite> findByToken(String token);
    List<AdminInvite> findByInvitedByEmailOrderByCreatedAtDesc(String email);
    List<AdminInvite> findAllByOrderByCreatedAtDesc();
    boolean existsByInvitedEmailAndUsedFalse(String email);
}
