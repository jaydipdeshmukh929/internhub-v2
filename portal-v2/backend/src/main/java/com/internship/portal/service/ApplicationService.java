package com.internship.portal.service;

import com.internship.portal.model.*;
import com.internship.portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ApplicationService {

    @Autowired private ApplicationRepository  applicationRepository;
    @Autowired private InternshipRepository   internshipRepository;
    @Autowired private UserRepository         userRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private EmailService           emailService;

    private GamificationService gamificationService;
    @Autowired
    public void setGamificationService(GamificationService gs) { this.gamificationService = gs; }

    // Injected lazily to avoid circular dependency
    private EmailTemplateService emailTemplateService;

    @Autowired
    public void setEmailTemplateService(EmailTemplateService emailTemplateService) {
        this.emailTemplateService = emailTemplateService;
    }

    public Map<String, Object> apply(Map<String, Object> body) {
        Map<String, Object> res = new HashMap<>();
        String email       = (String) body.get("studentEmail");
        String name        = (String) body.get("studentName");
        Long internshipId  = Long.valueOf(body.get("internshipId").toString());
        String coverLetter = (String) body.getOrDefault("coverLetter", "");

        if (applicationRepository.existsByStudentEmailAndInternshipId(email, internshipId)) {
            res.put("success", false); res.put("message", "Already applied"); return res;
        }

        Internship internship = internshipRepository.findById(internshipId).orElse(null);
        if (internship == null) {
            res.put("success", false); res.put("message", "Internship not found"); return res;
        }
        if (internship.getStatus() != Internship.Status.ACTIVE) {
            res.put("success", false); res.put("message", "This internship is no longer accepting applications"); return res;
        }

        // Check max applications limit
        if (internship.getOpenings() != null && internship.getOpenings() > 0) {
            long currentApps = applicationRepository.findByInternshipId(internshipId).size();
            if (currentApps >= internship.getOpenings() * 5L) { // 5x openings = soft cap
                res.put("success", false);
                res.put("message", "This internship has reached its application limit");
                return res;
            }
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        String resumePath = userOpt.map(User::getResumePath).orElse("");

        Application app = Application.create(email, name, internship.getCompanyName(),
                internship.getRole(), coverLetter, resumePath, internship);
        applicationRepository.save(app);

        // Increment application count
        internship.setApplicationCount((internship.getApplicationCount() == null ? 0 : internship.getApplicationCount()) + 1);

        // Auto-close internship if openings filled
        if (internship.getOpenings() != null && internship.getOpenings() > 0
                && internship.getApplicationCount() >= internship.getOpenings() * 10) {
            internship.setStatus(Internship.Status.CLOSED);
        }
        internshipRepository.save(internship);

        // In-app notification
        userOpt.ifPresent(user -> {
            Notification n = Notification.create(user,
                    "Application Submitted",
                    "You applied for " + internship.getRole() + " at " + internship.getCompanyName(),
                    "APPLICATION_UPDATE");
            notificationRepository.save(n);
        });

        emailService.sendApplicationConfirmation(email, name, internship.getRole(), internship.getCompanyName());
        res.put("success", true); res.put("message", "Application submitted successfully!");
        return res;
    }

    public Map<String, Object> updateStatus(Long appId, Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        Application app = applicationRepository.findById(appId).orElse(null);
        if (app == null) { res.put("success", false); res.put("message", "Not found"); return res; }

        Application.Status status = Application.Status.valueOf(body.get("status"));
        String note = body.getOrDefault("adminNote", "");
        app.setStatus(status);
        app.setAdminNote(note);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        // In-app notification
        userRepository.findByEmail(app.getStudentEmail()).ifPresent(user -> {
            Notification n = Notification.create(user,
                    "Application Update – " + app.getCompanyName(),
                    "Your application for " + app.getRole() + " is now: " + status.name().replace("_", " "),
                    "APPLICATION_UPDATE");
            notificationRepository.save(n);
        });

        // Send email using custom template
        emailTemplateService.sendTemplatedEmail(
                app.getStudentEmail(), app.getStudentName(),
                app.getRole(), app.getCompanyName(),
                status.name(), note
        );

        res.put("success", true); res.put("message", "Status updated to " + status);
        return res;
    }

    public Map<String, Object> scheduleInterview(Long appId, Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        Application app = applicationRepository.findById(appId).orElse(null);
        if (app == null) { res.put("success", false); return res; }

        app.setStatus(Application.Status.INTERVIEW_SCHEDULED);
        app.setInterviewScheduledAt(LocalDateTime.parse(body.get("dateTime")));
        app.setInterviewLink(body.get("link"));
        app.setInterviewType(body.get("type"));
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        emailService.sendInterviewDetails(
                app.getStudentEmail(), app.getStudentName(),
                app.getRole(), app.getCompanyName(),
                body.get("dateTime"), body.get("link"), body.get("type")
        );
        res.put("success", true); res.put("message", "Interview scheduled");
        return res;
    }

    public Map<String, Object> withdraw(Long appId, String email) {
        Map<String, Object> res = new HashMap<>();
        Application app = applicationRepository.findById(appId).orElse(null);
        if (app == null || !app.getStudentEmail().equals(email)) {
            res.put("success", false); return res;
        }
        app.setStatus(Application.Status.WITHDRAWN);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);
        res.put("success", true); res.put("message", "Application withdrawn");
        return res;
    }

    public List<Application> getAllApplications() { return applicationRepository.findAll(); }
    public List<Application> getByStudentEmail(String email) { return applicationRepository.findByStudentEmail(email); }
    public List<Application> getByInternship(Long id) { return applicationRepository.findByInternshipId(id); }

    public Map<String, Long> getAnalytics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers",        userRepository.count());
        stats.put("totalStudents",     userRepository.countByRole(User.Role.STUDENT));
        stats.put("totalInternships",  internshipRepository.count());
        stats.put("totalApplications", applicationRepository.count());
        stats.put("applied",           applicationRepository.countByStatus(Application.Status.APPLIED));
        stats.put("shortlisted",       applicationRepository.countByStatus(Application.Status.SHORTLISTED));
        stats.put("interview",         applicationRepository.countByStatus(Application.Status.INTERVIEW_SCHEDULED));
        stats.put("accepted",          applicationRepository.countByStatus(Application.Status.ACCEPTED));
        stats.put("rejected",          applicationRepository.countByStatus(Application.Status.REJECTED));
        return stats;
    }
}
