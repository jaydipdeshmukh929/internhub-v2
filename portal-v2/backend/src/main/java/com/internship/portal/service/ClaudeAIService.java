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

    @Value("${anthropic.api.key:}")
    private String apiKey;

    @Value("${anthropic.api.url:https://api.anthropic.com/v1/messages}")
    private String apiUrl;

    @Value("${anthropic.model:claude-sonnet-4-20250514}")
    private String model;

    @Autowired private UserRepository        userRepository;
    @Autowired private ApplicationRepository applicationRepository;

    private static final String SYSTEM_PROMPT =
            "You are InternHub AI Assistant — a smart, friendly, helpful assistant built into the InternHub internship portal.\n\n" +
                    "InternHub is a full-stack internship portal. Help students with:\n" +
                    "- Applying to internships: Explore page → find internship → Apply Now → cover letter → Submit\n" +
                    "- Profile: update name, bio, skills, college, degree, phone, upload resume/photo\n" +
                    "- Applications: track status (Applied→Under Review→Shortlisted→Interview→Accepted/Rejected)\n" +
                    "- Gamification: earn points (Apply=10, Resume=20, Profile 80%=50, Referral=30), build streaks, earn badges\n" +
                    "- 12 Badges: First Step, Explorer, Go-Getter, Profile Pro, Resume Ready, Resume Scorer, Connector, Super Connector, Accepted!, Interview Star, Certified, Portfolio Star\n" +
                    "- Levels: Bronze(0-74pts) → Silver(75-149) → Gold(150-299) → Platinum(300-499) → Diamond(500+)\n" +
                    "- Streaks: apply daily to build streak, 3 days=Hot Streak badge, 7 days=Week Warrior\n" +
                    "- AI Features (🤖 navbar): Cover Letter Generator, Interview Prep, Job Match Score (0-100), Resume Parser, AI Assistant\n" +
                    "- Security (🔒): enable 2FA, view login history, remember me 30 days, account deletion\n" +
                    "- Chat (💬): message admin directly\n" +
                    "- Announcements (📢): admin notices and updates\n" +
                    "- Save/bookmark internships with ☆ icon\n" +
                    "- Referral: share code from Features page, earn 30pts per referral\n\n" +
                    "Be friendly, use emojis, give step-by-step instructions. Also help with general career advice, resume tips, interview preparation, and coding questions. Keep responses concise and helpful.";

    public Map<String, Object> chat(String userMessage, String email, List<Map<String, String>> history) {
        Map<String, Object> res = new HashMap<>();

        System.out.println("=== AI CHAT REQUEST ===");
        System.out.println("Email: " + email);
        System.out.println("Message: " + userMessage);
        System.out.println("API Key configured: " + (apiKey != null && !apiKey.isBlank() && !apiKey.equals("YOUR_ANTHROPIC_API_KEY")));

        // If no API key → use keyword fallback
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_ANTHROPIC_API_KEY")) {
            System.out.println("No API key — using keyword fallback");
            res.put("success", true);
            res.put("reply",   getFallbackReply(userMessage));
            res.put("source",  "keyword");
            return res;
        }

        try {
            String context = buildUserContext(email);

            // Build messages list
            List<Map<String, Object>> messages = new ArrayList<>();

            // Add history (last 8 exchanges = 16 messages)
            if (history != null && !history.isEmpty()) {
                int start = Math.max(0, history.size() - 16);
                for (int i = start; i < history.size(); i++) {
                    Map<String, String> h = history.get(i);
                    String role    = h.getOrDefault("role", "user");
                    String content = h.getOrDefault("content", "");
                    if (!content.isBlank()) {
                        Map<String, Object> msg = new HashMap<>();
                        msg.put("role",    role);
                        msg.put("content", content);
                        messages.add(msg);
                    }
                }
            }

            // Add current message
            Map<String, Object> currentMsg = new HashMap<>();
            currentMsg.put("role",    "user");
            currentMsg.put("content", userMessage);
            messages.add(currentMsg);

            // Build request body
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model",      model);
            body.put("max_tokens", 1024);
            body.put("system",     SYSTEM_PROMPT + "\n\nStudent context: " + context);
            body.put("messages",   messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key",         apiKey);
            headers.set("anthropic-version", "2023-06-01");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            System.out.println("Calling Anthropic API...");
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, entity, Map.class);

            System.out.println("API Response status: " + response.getStatusCode());

            Map<String, Object> respBody = response.getBody();
            if (respBody != null && respBody.containsKey("content")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> content = (List<Map<String, Object>>) respBody.get("content");
                if (!content.isEmpty()) {
                    String reply = (String) content.get(0).get("text");
                    System.out.println("Claude replied successfully");
                    res.put("success", true);
                    res.put("reply",   reply);
                    res.put("source",  "claude");
                    return res;
                }
            }
            throw new RuntimeException("Empty or unexpected response from API");

        } catch (Exception e) {
            System.out.println("Claude API error: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            // Always fall back gracefully
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
            if (opt.isEmpty()) return "User: " + email;
            User u = opt.get();
            long apps = applicationRepository.findByStudentEmail(email).size();
            return "Name: " + u.getName() +
                    " | Skills: " + (u.getSkills() != null ? u.getSkills() : "not set") +
                    " | College: " + (u.getCollege() != null ? u.getCollege() : "not set") +
                    " | Profile: " + (u.getProfileCompletion() != null ? u.getProfileCompletion() : 0) + "%" +
                    " | Applications: " + apps +
                    " | Points: " + (u.getPoints() != null ? u.getPoints() : 0) +
                    " | Streak: " + (u.getStreakDays() != null ? u.getStreakDays() : 0) + " days";
        } catch (Exception e) {
            return "User: " + email;
        }
    }

    private String getFallbackReply(String message) {
        String q = message.toLowerCase().trim()
                .replace("?","").replace("!","").replace(",","");

        if (has(q,"hello") || has(q,"hi") || has(q,"hey") || has(q,"hii") || has(q,"helo"))
            return "Hi there! 👋 I'm InternHub AI Assistant. Ask me anything about applying, badges, streaks, AI features, security settings, and more. What would you like to know?";
        if (has(q,"thank"))
            return "You're welcome! 😊 Good luck with your internship search!";
        if ((has(q,"how") && has(q,"apply")) || (has(q,"apply") && has(q,"internship")) || q.equals("apply"))
            return "Here's how to apply:\n1️⃣ Go to the Explore page\n2️⃣ Find an internship you like\n3️⃣ Click on it to open the details\n4️⃣ Click the 'Apply Now' button\n5️⃣ Write a cover letter (optional but recommended)\n6️⃣ Click Submit!\n\nTrack all your applications on the My Applications page in the navbar. 🚀";
        if (has(q,"badge") || (has(q,"earn") && has(q,"badge")))
            return "There are 12 badges to earn:\n🎯 First Step — submit first application\n🔭 Explorer — apply to 5 internships\n🚀 Go-Getter — apply to 10 internships\n⭐ Profile Pro — 80% profile completion\n📄 Resume Ready — upload resume\n🏅 Resume Scorer — score 70+ on resume\n🤝 Connector — refer 1 friend\n💎 Super Connector — refer 5 friends\n🎉 Accepted! — get accepted\n🎤 Interview Star — get shortlisted\n📜 Certified — upload certificate\n💼 Portfolio Star — add portfolio\n\nEach badge gives +50 bonus points! Check 🏆 Gamification page.";
        if (has(q,"point") || (has(q,"earn") && has(q,"point")) || (has(q,"how") && has(q,"point")))
            return "How to earn points:\n📝 Apply to internship — +10 pts\n📄 Upload resume — +20 pts\n⭐ Complete profile 80% — +50 pts\n🤝 Refer a friend — +30 pts\n📜 Upload certificate — +25 pts\n💬 Write a review — +15 pts\n🏅 Earn any badge — +50 pts\n🔥 Daily streak bonus — +5×day pts\n\nLevels: Bronze → Silver → Gold → Platinum → Diamond!";
        if (has(q,"streak"))
            return "A streak counts consecutive days you apply!\n\n🔥 Apply today → streak = 1\n🔥🔥 Apply next day → streak = 2\n❌ Miss a day → streak resets\n\nStreak badges:\n🔥 Hot Streak — 3 days\n⚔️ Week Warrior — 7 days\n💥 Unstoppable — 30 days\n\nBonus points = 5 × streak days per application!";
        if (has(q,"level") || has(q,"rank") || has(q,"diamond") || has(q,"gold") || has(q,"bronze"))
            return "Levels based on total points:\n🥉 Bronze — 0 to 74 pts\n🥈 Silver — 75 to 149 pts\n🥇 Gold — 150 to 299 pts\n💎 Platinum — 300 to 499 pts\n💠 Diamond — 500+ pts\n\nCheck your level on 🏆 Gamification page!";
        if (has(q,"leaderboard") || (has(q,"top") && has(q,"student")))
            return "The Leaderboard shows top 20 students by points!\nGo to 🏆 Gamification → Leaderboard tab.\nYour row is highlighted so you can find your rank easily.";
        if ((has(q,"upload") && has(q,"resume")) || (has(q,"resume") && has(q,"how")))
            return "To upload your resume:\n1️⃣ Go to Profile in the navbar\n2️⃣ Click 'Resume & Photo' tab\n3️⃣ Drag and drop your PDF onto the upload zone\n4️⃣ Click Upload Resume\n\nYour resume auto-attaches to every application! ✅";
        if (has(q,"resume") && has(q,"parse") || has(q,"auto fill") || has(q,"autofill"))
            return "Resume Parser auto-fills your profile!\n1️⃣ Go to 🤖 AI Features → Resume Parser tab\n2️⃣ Drop your resume file\n3️⃣ Click 'Parse & Update Profile'\n\nIt extracts name, phone, college, degree, skills, LinkedIn, GitHub automatically!";
        if (has(q,"cover letter") || (has(q,"cover") && has(q,"letter")))
            return "Generate a cover letter with AI!\n1️⃣ Go to 🤖 AI Features → Cover Letter tab\n2️⃣ Select the internship\n3️⃣ Choose tone (Professional/Formal/Enthusiastic)\n4️⃣ Click Generate!\n\nThe AI uses your profile skills to write a personalized letter. Then copy and use it! ✍️";
        if (has(q,"interview") && (has(q,"prep") || has(q,"prepare") || has(q,"practice") || has(q,"question")))
            return "Practice interviews with AI!\n1️⃣ Go to 🤖 AI Features → Interview Prep tab\n2️⃣ Select the internship\n3️⃣ Click 'Get Questions'\n\nYou get:\n💼 General questions (tell me about yourself, strengths, etc.)\n💻 Technical questions (based on job skills)\n👥 HR questions\n\nClick any question to see answer tips!";
        if (has(q,"job match") || (has(q,"match") && has(q,"score")) || (has(q,"how") && has(q,"match")))
            return "Job Match Score shows how well your profile fits an internship (0-100)!\n\n1️⃣ Go to 🤖 AI Features → Job Match Score tab\n2️⃣ Select an internship\n3️⃣ Click 'Check My Match Score'\n\nScore breakdown:\n🛠 Skill match — 70% weight\n📊 Profile completion bonus — up to +8\n📄 Resume uploaded bonus — +5\n\n80%+ = Excellent Match! Apply with confidence 🚀";
        if (has(q,"profile") && (has(q,"complete") || has(q,"percent") || has(q,"how")))
            return "Profile completion breakdown:\n📝 Name — 15%\n📖 Bio — 15%\n🛠 Skills — 15%\n🏫 College — 10%\n🎓 Degree — 10%\n📞 Phone — 10%\n📄 Resume — 15%\n📷 Photo — 10%\n\nReach 80% to earn the Profile Pro badge + 50 points! Update everything on the Profile page.";
        if (has(q,"referral") || has(q,"refer") || has(q,"invite"))
            return "Earn points by referring friends!\n1️⃣ Go to Features page → Referral section\n2️⃣ Copy your unique referral code\n3️⃣ Share the link with friends\n4️⃣ When they register with your code → you earn 30 points!\n\n🤝 1 referral = Connector badge\n💎 5 referrals = Super Connector badge!";
        if (has(q,"2fa") || has(q,"two factor") || (has(q,"security") && has(q,"enable")))
            return "Enable 2FA for extra security!\n1️⃣ Click 🔒 in the navbar\n2️⃣ Click 'Enable 2FA'\n\nNext time you login:\n→ Enter password\n→ Receive 6-digit code on email\n→ Enter code → you're in!\n\nEven if someone knows your password, they can't login without the email code. 🔒";
        if ((has(q,"forgot") && has(q,"password")) || (has(q,"reset") && has(q,"password")))
            return "Reset your password:\n1️⃣ Go to Login page\n2️⃣ Click 'Forgot password?'\n3️⃣ Enter your email\n4️⃣ Enter the OTP from your email\n5️⃣ Set a new password\n\nThe OTP expires in 10 minutes!";
        if (has(q,"save") || has(q,"bookmark"))
            return "Save internships by clicking the ☆ star icon on any internship card!\nView all saved internships by clicking 'Saved' in the navbar. They stay saved permanently in your account. ⭐";
        if (has(q,"notification"))
            return "The 🔔 bell in the navbar shows unread notifications.\nYou get notified when: application is reviewed, you're shortlisted, interview is scheduled, you're accepted or rejected, and new chat messages arrive!";
        if (has(q,"chat") || (has(q,"message") && has(q,"admin")))
            return "Chat directly with admin!\n1️⃣ Click 💬 in the navbar\n2️⃣ Select a contact or start new chat\n3️⃣ Type and send messages\n\nMessages appear in real-time. The chat badge shows unread count.";
        if (has(q,"announcement") || has(q,"notice"))
            return "Check 📢 Announcements for important notices from admin!\nAnnouncements come as INFO, SUCCESS, WARNING, or URGENT. Pinned ones stay at the top. Click 📢 in the navbar!";
        if (has(q,"certificate"))
            return "Upload completion certificates!\n1️⃣ Go to Features → Certificate Upload\n2️⃣ Fill in company, role, date\n3️⃣ Upload PDF\n\nEarns 📜 Certified badge + 25 points!";
        if (has(q,"portfolio") || (has(q,"project") && has(q,"add")))
            return "Add projects to your portfolio!\n1️⃣ Go to Features → Portfolio section\n2️⃣ Enter project title and URL\n3️⃣ Click Add\n\nEarns 💼 Portfolio Star badge + 50 points! Add GitHub repos, websites, or Figma designs.";
        if (has(q,"dark mode") || has(q,"light mode") || has(q,"theme"))
            return "Toggle dark/light mode using the ☀️/🌙 button in the navbar top-right! Your preference is saved automatically.";
        if (has(q,"delete") && has(q,"account"))
            return "Request account deletion from 🔒 Security Settings.\nYour account will be deleted in 7 days. You can cancel anytime before that by clicking 'Cancel Deletion Request'.";
        if (has(q,"remember me") || (has(q,"stay") && has(q,"logged")))
            return "Check ✅ 'Remember me (30 days)' on the login page to stay logged in for 30 days instead of the default 24 hours!";
        if (has(q,"trending"))
            return "The 🔥 Trending tab on Dashboard shows internships with most views in last 7 days. These are the hottest opportunities right now!";
        if (has(q,"filter") || (has(q,"search") && has(q,"internship")))
            return "Use advanced filters on Dashboard!\nClick '🎛 Filters':\n🔍 Keyword, 📍 Location, 💰 Stipend range slider, 🏠 Remote, ⏱ Part-time\n\nSort by: Newest, Highest Stipend, Most Applied, Deadline, Most Viewed!";

        // Default helpful response
        return "I'm here to help! 😊 Here's what I can assist with:\n\n" +
                "📝 Applying — 'How do I apply?'\n" +
                "👤 Profile — 'How to complete my profile?'\n" +
                "🏅 Badges — 'How do I earn badges?'\n" +
                "🔥 Streaks — 'What is a streak?'\n" +
                "🤖 AI Tools — 'What are the AI features?'\n" +
                "🔒 Security — 'How to enable 2FA?'\n" +
                "🎯 Job Match — 'How is job match calculated?'\n" +
                "💰 Points — 'How do I earn points?'\n\n" +
                "Just type your question naturally! 😊";
    }

    private boolean has(String text, String word) {
        return text.contains(word);
    }
}
