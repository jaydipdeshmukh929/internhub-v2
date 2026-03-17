package com.internship.portal.repository;

import com.internship.portal.model.QnA;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QnARepository extends JpaRepository<QnA, Long> {
    List<QnA> findByInternshipIdOrderByAskedAtDesc(Long internshipId);
    List<QnA> findByQuestionByEmail(String email);
}
