package com.internship.portal.service;

import com.internship.portal.model.Internship;
import com.internship.portal.model.User;
import com.internship.portal.repository.InternshipRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired private InternshipRepository internshipRepository;
    @Autowired private UserRepository userRepository;

    public Map<String, Object> getRecommendations(String email) {
        Map<String, Object> result = new HashMap<>();

        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            result.put("success", false);
            result.put("message", "User not found");
            return result;
        }

        User user = opt.get();
        String skills = user.getSkills() != null ? user.getSkills().toLowerCase() : "";
        String degree = user.getDegree() != null ? user.getDegree().toLowerCase() : "";

        List<Internship> all = internshipRepository.findByStatus(Internship.Status.ACTIVE);

        // Score each internship by skill match
        List<Map<String, Object>> scored = new ArrayList<>();
        for (Internship i : all) {
            int score = 0;
            List<String> matchedSkills = new ArrayList<>();

            String reqSkills = i.getSkillsRequired() != null ? i.getSkillsRequired().toLowerCase() : "";
            String desc = (i.getDescription() != null ? i.getDescription() : "").toLowerCase();
            String category = i.getCategory() != null ? i.getCategory().toLowerCase() : "";

            // Skill match scoring
            if (!skills.isBlank()) {
                for (String userSkill : skills.split(",")) {
                    String s = userSkill.trim();
                    if (!s.isEmpty() && (reqSkills.contains(s) || desc.contains(s))) {
                        score += 20;
                        matchedSkills.add(userSkill.trim());
                    }
                }
            }

            // Degree match
            if (!degree.isBlank()) {
                if (degree.contains("computer") && category.contains("tech")) score += 15;
                if (degree.contains("business") && (category.contains("marketing") || category.contains("finance"))) score += 15;
                if (degree.contains("design") && category.contains("design")) score += 15;
            }

            // Remote bonus
            if (i.isRemote()) score += 5;

            // Recency bonus
            if (i.getPostedAt() != null) {
                long daysAgo = java.time.Duration.between(i.getPostedAt(), java.time.LocalDateTime.now()).toDays();
                if (daysAgo <= 7) score += 10;
                else if (daysAgo <= 14) score += 5;
            }

            if (score > 0) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("internship", i);
                entry.put("matchScore", Math.min(100, score));
                entry.put("matchedSkills", matchedSkills);
                scored.add(entry);
            }
        }

        // Sort by score descending, take top 8
        scored.sort((a, b) -> (int) b.get("matchScore") - (int) a.get("matchScore"));
        List<Map<String, Object>> top = scored.size() > 8 ? scored.subList(0, 8) : scored;

        // If no matches, return latest 5
        if (top.isEmpty()) {
            List<Internship> latest = internshipRepository.findTop5ByStatusOrderByPostedAtDesc(Internship.Status.ACTIVE);
            for (Internship i : latest) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("internship", i);
                entry.put("matchScore", 0);
                entry.put("matchedSkills", new ArrayList<>());
                top.add(entry);
            }
            result.put("noSkillsSet", true);
        }

        result.put("success", true);
        result.put("recommendations", top);
        result.put("userSkills", skills);
        return result;
    }
}
