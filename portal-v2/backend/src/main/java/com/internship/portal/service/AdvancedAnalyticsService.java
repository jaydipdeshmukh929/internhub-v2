package com.internship.portal.service;

import com.internship.portal.model.Application;
import com.internship.portal.model.User;
import com.internship.portal.repository.ApplicationRepository;
import com.internship.portal.repository.InternshipRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdvancedAnalyticsService {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private UserRepository        userRepository;
    @Autowired private InternshipRepository  internshipRepository;

    // ── Conversion Funnel ───────────────────────────────────────────────────
    public Map<String, Object> getConversionFunnel() {
        Map<String, Object> res = new HashMap<>();
        List<Application> all = applicationRepository.findAll();
        long total       = all.size();
        long underReview = all.stream().filter(a -> a.getStatus() != Application.Status.APPLIED).count();
        long shortlisted = all.stream().filter(a ->
                a.getStatus() == Application.Status.SHORTLISTED ||
                        a.getStatus() == Application.Status.INTERVIEW_SCHEDULED ||
                        a.getStatus() == Application.Status.ACCEPTED).count();
        long interview   = all.stream().filter(a ->
                a.getStatus() == Application.Status.INTERVIEW_SCHEDULED ||
                        a.getStatus() == Application.Status.ACCEPTED).count();
        long accepted    = all.stream().filter(a -> a.getStatus() == Application.Status.ACCEPTED).count();

        res.put("funnel", Map.of(
                "Applied",            total,
                "Under Review",       underReview,
                "Shortlisted",        shortlisted,
                "Interview Scheduled",interview,
                "Accepted",           accepted
        ));
        res.put("rates", Map.of(
                "reviewRate",     total>0 ? Math.round(underReview * 100.0 / total)  : 0,
                "shortlistRate",  total>0 ? Math.round(shortlisted * 100.0 / total)  : 0,
                "interviewRate",  total>0 ? Math.round(interview   * 100.0 / total)  : 0,
                "acceptanceRate", total>0 ? Math.round(accepted    * 100.0 / total)  : 0
        ));
        return res;
    }

    // ── Time-to-Hire Analytics ───────────────────────────────────────────────
    public Map<String, Object> getTimeToHire() {
        Map<String, Object> res = new HashMap<>();
        List<Application> accepted = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == Application.Status.ACCEPTED &&
                        a.getAppliedAt() != null && a.getUpdatedAt() != null)
                .collect(Collectors.toList());

        if (accepted.isEmpty()) {
            res.put("avgDays", 0);
            res.put("minDays", 0);
            res.put("maxDays", 0);
            res.put("message", "No accepted applications yet");
            return res;
        }

        List<Long> days = accepted.stream()
                .map(a -> ChronoUnit.DAYS.between(a.getAppliedAt(), a.getUpdatedAt()))
                .filter(d -> d >= 0)
                .collect(Collectors.toList());

        double avg = days.stream().mapToLong(Long::longValue).average().orElse(0);
        long   min = days.stream().mapToLong(Long::longValue).min().orElse(0);
        long   max = days.stream().mapToLong(Long::longValue).max().orElse(0);

        // Distribution: <7 days, 7-14, 14-30, 30+
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("< 7 days",  days.stream().filter(d -> d < 7).count());
        distribution.put("7-14 days", days.stream().filter(d -> d >= 7  && d < 14).count());
        distribution.put("14-30 days",days.stream().filter(d -> d >= 14 && d < 30).count());
        distribution.put("30+ days",  days.stream().filter(d -> d >= 30).count());

        res.put("avgDays",      Math.round(avg * 10.0) / 10.0);
        res.put("minDays",      min);
        res.put("maxDays",      max);
        res.put("distribution", distribution);
        res.put("totalAccepted",accepted.size());
        return res;
    }

    // ── Cohort Analysis ──────────────────────────────────────────────────────
    public Map<String, Object> getCohortAnalysis() {
        Map<String, Object> res = new HashMap<>();
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .collect(Collectors.toList());

        // Group by registration month
        Map<String, Long> registrations = students.stream()
                .filter(u -> u.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        u -> u.getCreatedAt().getYear() + "-" +
                                String.format("%02d", u.getCreatedAt().getMonthValue()),
                        Collectors.counting()));

        // Students with at least 1 application
        Set<String> studentsWithApps = applicationRepository.findAll().stream()
                .map(Application::getStudentEmail).collect(Collectors.toSet());

        // Activation rate (registered → applied)
        long totalStudents  = students.size();
        long activeStudents = students.stream()
                .filter(u -> studentsWithApps.contains(u.getEmail())).count();
        double activationRate = totalStudents > 0 ?
                Math.round(activeStudents * 100.0 / totalStudents * 10) / 10.0 : 0;

        // Profile completion distribution
        Map<String, Long> profileDist = new LinkedHashMap<>();
        profileDist.put("0-25%",  students.stream().filter(u -> (u.getProfileCompletion()==null?0:u.getProfileCompletion()) < 25).count());
        profileDist.put("25-50%", students.stream().filter(u -> { int p=u.getProfileCompletion()==null?0:u.getProfileCompletion(); return p>=25&&p<50; }).count());
        profileDist.put("50-80%", students.stream().filter(u -> { int p=u.getProfileCompletion()==null?0:u.getProfileCompletion(); return p>=50&&p<80; }).count());
        profileDist.put("80-100%",students.stream().filter(u -> (u.getProfileCompletion()==null?0:u.getProfileCompletion()) >= 80).count());

        res.put("registrationsByMonth", registrations);
        res.put("totalStudents",   totalStudents);
        res.put("activeStudents",  activeStudents);
        res.put("activationRate",  activationRate);
        res.put("profileDistribution", profileDist);
        res.put("premiumStudents", students.stream().filter(User::isPremium).count());
        return res;
    }
}
