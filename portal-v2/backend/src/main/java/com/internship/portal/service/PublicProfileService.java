package com.internship.portal.service;

import com.internship.portal.model.User;
import com.internship.portal.repository.ApplicationRepository;
import com.internship.portal.repository.BadgeRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PublicProfileService {

    @Autowired private UserRepository        userRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private BadgeRepository       badgeRepository;

    // Generate or get public slug
    public Map<String, Object> enablePublicProfile(String email) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            if (u.getPublicSlug() == null || u.getPublicSlug().isBlank()) {
                String base = u.getName() != null
                        ? u.getName().toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-")
                        : "student";
                String slug = base + "-" + u.getId();
                u.setPublicSlug(slug);
            }
            u.setProfilePublic(true);
            userRepository.save(u);
            res.put("slug", u.getPublicSlug());
            res.put("url",  "http://localhost:3000/student/" + u.getPublicSlug());
        });
        res.put("success", true);
        return res;
    }

    public Map<String, Object> disablePublicProfile(String email) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setProfilePublic(false);
            userRepository.save(u);
        });
        res.put("success", true);
        return res;
    }

    // Get public profile by slug
    public Map<String, Object> getBySlug(String slug) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findAll().stream()
                .filter(u -> slug.equals(u.getPublicSlug()) && u.isProfilePublic())
                .findFirst()
                .ifPresentOrElse(u -> {
                    Map<String, Object> profile = new HashMap<>();
                    profile.put("name",             u.getName());
                    profile.put("bio",              u.getBio());
                    profile.put("skills",           u.getSkills());
                    profile.put("college",          u.getCollege());
                    profile.put("degree",           u.getDegree());
                    profile.put("graduationYear",   u.getGraduationYear());
                    profile.put("linkedinUrl",      u.getLinkedinUrl());
                    profile.put("githubUrl",        u.getGithubUrl());
                    profile.put("portfolioLinks",   u.getPortfolioLinks());
                    profile.put("profilePhoto",     u.getProfilePhoto());
                    profile.put("profileCompletion",u.getProfileCompletion());
                    profile.put("points",           u.getPoints());
                    profile.put("badges",           badgeRepository.findByStudentEmail(u.getEmail()));
                    profile.put("isAlumni",         u.isAlumni());
                    profile.put("isPremium",        u.isPremium());
                    profile.put("applicationsCount",applicationRepository.findByStudentEmail(u.getEmail()).size());
                    res.put("found",   true);
                    res.put("profile", profile);
                }, () -> res.put("found", false));
        return res;
    }

    // Premium subscription
    public Map<String, Object> activatePremium(String email, int months) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setPremium(true);
            u.setPremiumUntil(LocalDateTime.now().plusMonths(months));
            userRepository.save(u);
        });
        res.put("success", true);
        res.put("message", "Premium activated for " + months + " month(s)!");
        return res;
    }

    // Mark as alumni
    public Map<String, Object> markAlumni(String email, String completedAt) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setAlumni(true);
            u.setCompletedAt(completedAt);
            userRepository.save(u);
        });
        res.put("success", true);
        return res;
    }

    // Weekly email digest — get internships matching user skills
    public List<Map<String, Object>> getWeeklyDigestData(String email) {
        return new ArrayList<>(); // Populated by scheduler
    }
}
