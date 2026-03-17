package com.internship.portal.service;

import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class ResumeScoreService {

    @Autowired private UserRepository userRepository;

    private static final List<String> TECH_SKILLS = Arrays.asList(
            "java","python","javascript","typescript","react","angular","vue","spring","node",
            "mysql","mongodb","postgresql","docker","kubernetes","aws","git","html","css",
            "rest","api","hibernate","maven","gradle","jenkins","linux","sql"
    );

    private static final List<String> POWER_WORDS = Arrays.asList(
            "developed","built","designed","implemented","optimized","led","managed",
            "created","improved","achieved","delivered","launched","automated","reduced",
            "increased","collaborated","integrated","deployed","migrated","architected"
    );

    public Map<String, Object> analyzeResume(String email, MultipartFile file) {
        Map<String, Object> res = new HashMap<>();
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8).toLowerCase();
            int score = 0;
            List<String> strengths    = new ArrayList<>();
            List<String> improvements = new ArrayList<>();

            // 1. Contact Info (10 pts)
            if (content.contains("@"))          { score += 3; strengths.add("Email address present"); }
            else improvements.add("Add your email address");

            if (content.contains("phone") || content.contains("mobile") || content.matches("(?s).*\\d{10}.*"))
            { score += 3; strengths.add("Phone number present"); }
            else improvements.add("Add your phone number");

            if (content.contains("linkedin"))   { score += 2; strengths.add("LinkedIn profile linked"); }
            else improvements.add("Add your LinkedIn URL");

            if (content.contains("github"))     { score += 2; strengths.add("GitHub profile linked"); }
            else improvements.add("Add your GitHub URL");

            // 2. Education (15 pts)
            boolean hasEdu = content.contains("education") || content.contains("university") ||
                    content.contains("college")   || content.contains("b.tech")     ||
                    content.contains("bachelor");
            if (hasEdu) { score += 10; strengths.add("Education section found"); }
            else improvements.add("Add an Education section");

            boolean hasCgpa = content.contains("cgpa") || content.contains("gpa") || content.contains("percentage");
            if (hasCgpa) { score += 5; strengths.add("Academic score/CGPA mentioned"); }
            else improvements.add("Mention your CGPA or percentage");

            // 3. Experience / Projects (25 pts)
            boolean hasExp  = content.contains("experience") || content.contains("internship") || content.contains("worked");
            boolean hasProj = content.contains("project")    || content.contains("built")      || content.contains("developed");
            if (hasExp)  { score += 12; strengths.add("Work/Internship experience present"); }
            else improvements.add("Add work experience or internship section");
            if (hasProj) { score += 13; strengths.add("Projects section present"); }
            else improvements.add("Add at least 2-3 personal or academic projects");

            // 4. Skills (20 pts)
            long skillMatches = TECH_SKILLS.stream().filter(content::contains).count();
            score += (int) Math.min(skillMatches * 2, 20);
            if (skillMatches >= 5) strengths.add("Good technical skills (" + skillMatches + " found)");
            else improvements.add("Expand your skills — only " + skillMatches + " tech skills found");

            // 5. Power words (15 pts)
            long powerWords = POWER_WORDS.stream().filter(content::contains).count();
            score += (int) Math.min(powerWords * 3, 15);
            if (powerWords >= 3) strengths.add("Strong action verbs used (" + powerWords + " found)");
            else improvements.add("Use action verbs: 'developed', 'built', 'optimized', 'led'");

            // 6. Length (15 pts)
            int wordCount = content.split("\\s+").length;
            if      (wordCount > 400) { score += 15; strengths.add("Good content depth (" + wordCount + " words)"); }
            else if (wordCount > 200) { score += 10; improvements.add("Add more detail — aim for 400+ words"); }
            else                      { score += 5;  improvements.add("Resume too short — add more details"); }

            score = Math.min(score, 100);

            String grade, emoji;
            if      (score >= 85) { grade = "Excellent";   emoji = "🏆"; }
            else if (score >= 70) { grade = "Good";        emoji = "✅"; }
            else if (score >= 50) { grade = "Average";     emoji = "⚠️"; }
            else                  { grade = "Needs Work";  emoji = "❌"; }

            res.put("success",      true);
            res.put("score",        score);
            res.put("grade",        grade);
            res.put("emoji",        emoji);
            res.put("strengths",    strengths);
            res.put("improvements", improvements);
            res.put("wordCount",    wordCount);
            res.put("skillsFound",  skillMatches);

        } catch (IOException e) {
            res.put("success", false);
            res.put("message", "Could not read file: " + e.getMessage());
        }
        return res;
    }
}
