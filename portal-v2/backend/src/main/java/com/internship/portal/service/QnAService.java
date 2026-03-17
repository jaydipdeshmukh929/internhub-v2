package com.internship.portal.service;

import com.internship.portal.model.QnA;
import com.internship.portal.repository.QnARepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class QnAService {

    @Autowired private QnARepository qnaRepository;

    public Map<String, Object> askQuestion(Map<String, Object> body) {
        Map<String, Object> res = new HashMap<>();
        QnA q = new QnA();
        q.setInternshipId(Long.valueOf(body.get("internshipId").toString()));
        q.setInternshipRole((String) body.get("internshipRole"));
        q.setCompanyName((String) body.get("companyName"));
        q.setQuestionByEmail((String) body.get("email"));
        q.setQuestionByName((String) body.get("name"));
        q.setQuestion((String) body.get("question"));
        qnaRepository.save(q);
        res.put("success", true);
        res.put("message", "Question submitted!");
        return res;
    }

    public Map<String, Object> answerQuestion(Long qnaId, String answer,
                                              String adminEmail, String adminName) {
        Map<String, Object> res = new HashMap<>();
        qnaRepository.findById(qnaId).ifPresentOrElse(q -> {
            q.setAnswer(answer);
            q.setAnsweredByEmail(adminEmail);
            q.setAnsweredByName(adminName);
            q.setAnsweredAt(LocalDateTime.now());
            qnaRepository.save(q);
            res.put("success", true);
        }, () -> res.put("success", false));
        return res;
    }

    public List<QnA> getByInternship(Long internshipId) {
        return qnaRepository.findByInternshipIdOrderByAskedAtDesc(internshipId);
    }

    public List<QnA> getAll() {
        return qnaRepository.findAll();
    }
}
