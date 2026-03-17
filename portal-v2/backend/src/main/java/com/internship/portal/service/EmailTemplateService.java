package com.internship.portal.service;

import com.internship.portal.model.EmailTemplate;
import com.internship.portal.repository.EmailTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EmailTemplateService {

    @Autowired private EmailTemplateRepository emailTemplateRepository;
    @Autowired private EmailService emailService;

    private static final Map<String, String[]> DEFAULTS = new HashMap<>();
    static {
        DEFAULTS.put("ACCEPTED", new String[]{
                "Congratulations! Your application has been accepted – {company}",
                "Hi {studentName},\n\nCongratulations! Your application for \"{role}\" at {company} has been ACCEPTED!\n\n{adminNote}\n\nThe team will reach out to you shortly.\n\nBest regards,\nInternHub Team"
        });
        DEFAULTS.put("REJECTED", new String[]{
                "Application Update – {company}",
                "Hi {studentName},\n\nThank you for applying for \"{role}\" at {company}.\n\nAfter careful consideration, your application was not selected this time.\n\n{adminNote}\n\nKeep exploring other opportunities!\n\nBest regards,\nInternHub Team"
        });
        DEFAULTS.put("SHORTLISTED", new String[]{
                "You have been shortlisted – {company}",
                "Hi {studentName},\n\nGreat news! You have been SHORTLISTED for \"{role}\" at {company}.\n\n{adminNote}\n\nStay tuned for further updates.\n\nInternHub Team"
        });
        DEFAULTS.put("INTERVIEW_SCHEDULED", new String[]{
                "Interview Scheduled – {company}",
                "Hi {studentName},\n\nYour interview for \"{role}\" at {company} has been scheduled!\n\n{adminNote}\n\nPrepare well!\n\nInternHub Team"
        });
    }

    public List<EmailTemplate> getAllTemplates() {
        return emailTemplateRepository.findAll();
    }

    public Map<String, Object> saveTemplate(EmailTemplate template, String adminEmail) {
        Map<String, Object> res = new HashMap<>();
        Optional<EmailTemplate> existing = emailTemplateRepository
                .findByTemplateTypeAndActiveTrue(template.getTemplateType());
        EmailTemplate et = existing.orElse(new EmailTemplate());
        et.setTemplateType(template.getTemplateType());
        et.setSubject(template.getSubject());
        et.setBody(template.getBody());
        et.setActive(true);
        et.setCreatedByEmail(adminEmail);
        et.setUpdatedAt(LocalDateTime.now());
        emailTemplateRepository.save(et);
        res.put("success", true);
        res.put("message", "Template saved for " + template.getTemplateType());
        return res;
    }

    public void sendTemplatedEmail(String toEmail, String studentName,
                                   String role, String company,
                                   String status, String adminNote) {
        String subject;
        String body;

        Optional<EmailTemplate> customTemplate = emailTemplateRepository
                .findByTemplateTypeAndActiveTrue(status);

        if (customTemplate.isPresent()) {
            subject = customTemplate.get().getSubject();
            body    = customTemplate.get().getBody();
        } else {
            String[] def = DEFAULTS.getOrDefault(status, new String[]{
                    "Application Update – " + company,
                    "Hi {studentName},\n\nYour application for \"{role}\" at {company} is now: "
                            + status + "\n\n{adminNote}\n\nInternHub Team"
            });
            subject = def[0];
            body    = def[1];
        }

        String noteText = (adminNote != null && !adminNote.isBlank())
                ? "Note from recruiter: " + adminNote : "";
        subject = subject.replace("{company}", company)
                .replace("{role}", role)
                .replace("{studentName}", studentName);
        body    = body.replace("{studentName}", studentName)
                .replace("{role}", role)
                .replace("{company}", company)
                .replace("{adminNote}", noteText);

        emailService.sendRaw(toEmail, subject, body);
    }

    public Map<String, String[]> getDefaultTemplates() {
        return DEFAULTS;
    }
}
