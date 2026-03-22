package com.internship.portal.service;

import com.internship.portal.model.User;
import com.internship.portal.repository.ApplicationRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ClaudeAIService {

    // Default empty string — never throws if key is missing
    @Value("${anthropic.api.key:}")
    private String apiKey;

    @Value("${anthropic.api.url:https://api.anthropic.com/v1/messages}")
    private String apiUrl;

    @Value("${anthropic.model:claude-sonnet-4-20250514}")
    private String model;

    @Autowired private UserRepository        userRepository;
    @Autowired private ApplicationRepository applicationRepository;

    private static final String SYSTEM_PROMPT =
            "You are InternHub AI Assistant — a smart, friendly assistant built into the InternHub internship portal.\n\n" +
                    "Help students with everything related to InternHub and their internship journey.\n\n" +
                    "PLATFORM FEATURES:\n" +
                    "- Browse, search, filter internships (keyword, location, category, stipend, remote, part-time)\n" +
                    "- Apply with cover letter, track pipeline: Applied→Under Review→Shortlisted→Interview→Accepted/Rejected\n" +
                    "- Save/bookmark internships, recently viewed tab, trending tab\n" +
                    "- Profile: name, bio, skills, college, degree, phone, resume upload (drag & drop), photo\n" +
                    "- AI Features: Cover Letter Generator, Interview Prep, Job Match Score (0-100), Resume Parser, AI Chat\n" +
                    "- Gamification: Points, Badges (12 total), Streaks, Levels (Bronze→Silver→Gold→Platinum→Diamond), Leaderboard\n" +
                    "- Communication: In-app Chat with admin, Q&A on listings, Announcements board\n" +
                    "- Security: 2FA, Login history, Remember Me (30 days), Account deletion\n" +
                    "- Admin: Manage internships/applications/users, Analytics charts, Bulk import Excel/CSV, Export Excel, Email templates\n\n" +
                    "POINTS: Apply=10, Resume=20, Profile 80%=50, Referral=30, Certificate=25, Review=15, Badge=+50 each\n" +
                    "LEVELS: Bronze 0-74, Silver 75-149, Gold 150-299, Platinum 300-499, Diamond 500+\n" +
                    "STREAKS: Apply daily to maintain. 3 days=Hot Streak badge, 7 days=Week Warrior, 30 days=Unstoppable\n\n" +
                    "Be friendly, use emojis, give step-by-step instructions. " +
                    "Also answer general career, resume, and tech interview questions helpfully.";

    public Map<String, Object> chat(String userMessage, String email,
                                    List<Map<String, String>> history) {
        Map<String, Object> res = new HashMap<>();

        // Check if API key is configured
        boolean hasKey = apiKey != null
                && !apiKey.isBlank()
                && !apiKey.equals("PASTE_YOUR_KEY_HERE")
                && !apiKey.equals("YOUR_ANTHROPIC_API_KEY")
                && apiKey.startsWith("sk-");

        if (!hasKey) {
            res.put("success", true);
            res.put("reply",   getFallbackReply(userMessage));
            res.put("source",  "keyword");
            return res;
        }

        try {
            String context = buildUserContext(email);
            String system  = SYSTEM_PROMPT + "\n\nCURRENT USER: " + context;

            // Build messages with history
            List<Map<String, String>> messages = new ArrayList<>();
            if (history != null) {
                int start = Math.max(0, history.size() - 10);
                for (int i = start; i < history.size(); i++) {
                    messages.add(history.get(i));
                }
            }
            messages.add(Map.of("role", "user", "content", userMessage));

            // Build request
            Map<String, Object> reqBody = new LinkedHashMap<>();
            reqBody.put("model",      model);
            reqBody.put("max_tokens", 1024);
            reqBody.put("system",     system);
            reqBody.put("messages",   messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key",         apiKey);
            headers.set("anthropic-version", "2023-06-01");

            RestTemplate rt = new RestTemplate();
            ResponseEntity<Map> response = rt.exchange(
                    apiUrl, HttpMethod.POST,
                    new HttpEntity<>(reqBody, headers), Map.class);

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("content")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> content =
                        (List<Map<String, Object>>) body.get("content");
                if (!content.isEmpty()) {
                    String reply = (String) content.get(0).get("text");
                    res.put("success", true);
                    res.put("reply",   reply);
                    res.put("source",  "claude");
                    return res;
                }
            }
            throw new RuntimeException("Empty response from API");

        } catch (Exception e) {
            System.out.println("Claude API error: " + e.getMessage());
            res.put("success", true);
            res.put("reply",   getFallbackReply(userMessage));
            res.put("source",  "keyword");
            return res;
        }
    }

    private String buildUserContext(String email) {
        if (email == null || email.isBlank()) return "Guest user";
        try {
            Optional<User> opt = userRepository.findByEmail(email);
            if (opt.isEmpty()) return "Unknown user";
            User u = opt.get();
            long apps = applicationRepository.findByStudentEmail(email).size();
            return String.format(
                    "Name=%s, College=%s, Skills=%s, ProfileCompletion=%d%%, " +
                            "Applications=%d, Points=%d, Streak=%d days, Badges=%d",
                    u.getName(),
                    u.getCollege()  != null ? u.getCollege()  : "not set",
                    u.getSkills()   != null ? u.getSkills()   : "not set",
                    u.getProfileCompletion() != null ? u.getProfileCompletion() : 0,
                    apps,
                    u.getPoints()    != null ? u.getPoints()    : 0,
                    u.getStreakDays() != null ? u.getStreakDays() : 0,
                    u.getBadgeCount() != null ? u.getBadgeCount() : 0
            );
        } catch (Exception e) {
            return "User context unavailable";
        }
    }

    private String getFallbackReply(String message) {
        String q = message.toLowerCase().trim()
                .replace("?", "").replace("!", "");

        if (has(q,"hello")||has(q,"hi")||has(q,"hey"))
            return "Hi there! 👋 I'm InternHub AI Assistant. Ask me anything — applying, badges, streaks, AI features, or career tips!";
        if (has(q,"apply")||has(q,"application"))
            return "To apply:\n1️⃣ Go to Explore\n2️⃣ Click an internship\n3️⃣ Click Apply Now\n4️⃣ Write cover letter\n5️⃣ Submit!\n\nTrack applications on My Applications page.";
        if (has(q,"resume"))
            return "Upload resume: Profile → Resume & Photo tab → drag & drop PDF → Upload Resume. Attaches to all applications automatically! 📄";
        if (has(q,"badge"))
            return "12 badges to earn! First Step (1st apply), Explorer (5 apps), Go-Getter (10 apps), Profile Pro (80% profile), and more. Each badge = +50 points! Check 🏆 Gamification.";
        if (has(q,"streak"))
            return "Apply every day to build streak! 🔥\n3 days = Hot Streak badge\n7 days = Week Warrior\n30 days = Unstoppable\n\nBonus points = 5 × streak days!";
        if (has(q,"point")||has(q,"level"))
            return "Points: Apply=10, Resume=20, Profile 80%=50, Referral=30, Certificate=25.\nLevels: Bronze(0)→Silver(75)→Gold(150)→Platinum(300)→Diamond(500)! 🏆";
        if (has(q,"2fa")||has(q,"security"))
            return "Enable 2FA in 🔒 Security Settings. Each login needs email code — very secure! 🔐";
        if (has(q,"cover letter")||has(q,"coverletter"))
            return "Use AI Cover Letter Generator! 🤖 AI Features → Cover Letter tab → select internship → choose tone → Generate! ✍️";
        if (has(q,"interview"))
            return "AI Interview Prep: 🤖 AI Features → Interview Prep → select internship → get role-specific questions with tips! 🎤";
        if (has(q,"match")||has(q,"score")||has(q,"fit"))
            return "Job Match Score: 🤖 AI Features → Job Match Score → select internship → see 0-100 score! 80%+ = Excellent Match 🎯";
        if (has(q,"chat")||has(q,"message"))
            return "Chat with admin using 💬 in the navbar! Messages appear in real-time. Unread count shown on the icon.";
        if (has(q,"thank"))
            return "You're welcome! 😊 Good luck with your internship search!";
        if (has(q,"leaderboard")||has(q,"rank"))
            return "See top 20 students on 🏆 Gamification → Leaderboard tab! Ranked by points. Your row is highlighted. 🥇";
        if (has(q,"filter")||has(q,"search"))
            return "Use 🎛 Filters on Dashboard: keyword, location, stipend slider, remote ✅, part-time ✅. Sort by Newest/Stipend/Applied/Deadline/Views!";
        if (has(q,"notification")||has(q,"bell"))
            return "🔔 Bell in navbar shows unread notifications. You get notified for every status change, interview schedule, and message!";
        if (has(q,"save")||has(q,"bookmark"))
            return "Click ☆ on any internship card to save it. View all saved internships on the Saved page in navbar! ⭐";

        return "I'm here to help! 😊 Try asking about:\n• Applying for internships\n• Earning badges & points\n• Streak system\n• AI features\n• Profile setup\n• Interview tips\n• Security (2FA)\n\nWhat would you like to know?";
    }

    private boolean has(String text, String word) {
        return text.contains(word);
    }
}
