package com.internship.portal.repository;

import com.internship.portal.model.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    Optional<EmailTemplate> findByTemplateTypeAndActiveTrue(String templateType);
    List<EmailTemplate> findAll();
}
