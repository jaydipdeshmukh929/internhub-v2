package com.internship.portal.service;

import com.internship.portal.model.Internship;
import com.internship.portal.model.User;
import com.internship.portal.repository.InternshipRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Autowired private UserRepository       userRepository;
    @Autowired private InternshipRepository internshipRepository;

    // ── Cover Letter Generator ─────────────────────────────────────────────────
    public Map<String, Object> generateCoverLetter(String email, Long internshipId, String tone) {
        Map<String, Object> res = new HashMap<>();
        User user = userRepository.findByEmail(email).orElse(null);
        Internship job = internshipId != null ? internshipRepository.findById(internshipId).orElse(null) : null;
        if (user == null) { res.put("success", false); res.put("message", "User not found"); return res; }

        String name      = user.getName()    != null ? user.getName()    : "Candidate";
        String skills    = user.getSkills()  != null ? user.getSkills()  : "communication, teamwork";
        String college   = user.getCollege() != null ? user.getCollege() : "my university";
        String degree    = user.getDegree()  != null ? user.getDegree()  : "my degree";
        String role      = job != null ? job.getRole()        : "this internship position";
        String company   = job != null ? job.getCompanyName() : "your company";
        String jobSkills = job != null && job.getSkillsRequired() != null ? job.getSkillsRequired() : "";

        List<String> jSkills = Arrays.stream(jobSkills.split(",")).map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toList());
        List<String> uSkills = Arrays.stream(skills.split(",")).map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toList());
        List<String> matched = jSkills.stream().filter(j -> uSkills.stream().anyMatch(u -> u.toLowerCase().contains(j.toLowerCase()) || j.toLowerCase().contains(u.toLowerCase()))).limit(3).collect(Collectors.toList());
        String matchedStr = matched.isEmpty() ? (uSkills.isEmpty() ? skills : uSkills.get(0)) : String.join(", ", matched);

        String opening, closing;
        if ("formal".equalsIgnoreCase(tone)) {
            opening = "I am writing to express my strong interest in the " + role + " position at " + company + ".";
            closing = "I would welcome the opportunity to discuss how my background and skills can contribute to " + company + "'s goals. Thank you for considering my application.";
        } else if ("enthusiastic".equalsIgnoreCase(tone)) {
            opening = "I am incredibly excited to apply for the " + role + " role at " + company + " — a company I deeply admire!";
            closing = "I would love the chance to bring my energy and skills to your team. Thank you so much for this opportunity!";
        } else {
            opening = "I came across the " + role + " opening at " + company + " and felt it was a perfect match for my skills and goals.";
            closing = "I would love the chance to contribute to " + company + " and grow through this experience. Looking forward to hearing from you!";
        }

        String letter = "Dear Hiring Team at " + company + ",\n\n" +
                opening + "\n\n" +
                "I am currently pursuing " + degree + " at " + college + ". Over the past year, I have developed strong proficiency in " + skills + " and I am eager to apply these skills in a real-world setting.\n\n" +
                "My experience with " + matchedStr + " aligns well with the requirements of this role. I am a fast learner, a collaborative team player, and I am deeply motivated to deliver impactful work during my internship.\n\n" +
                (jobSkills.isBlank() ? "" : "I am particularly excited about working with " + (jSkills.isEmpty() ? jobSkills : jSkills.get(0)) + " — an area I have actively worked on and am confident in.\n\n") +
                closing + "\n\nWarm regards,\n" + name;

        res.put("success",      true);
        res.put("coverLetter",  letter);
        res.put("wordCount",    letter.split("\\s+").length);
        res.put("matchedSkills", matched);
        return res;
    }

    // ── Interview Preparation ──────────────────────────────────────────────────
    public Map<String, Object> getInterviewPrep(Long internshipId, String email) {
        Map<String, Object> res = new HashMap<>();
        Internship job = internshipId != null ? internshipRepository.findById(internshipId).orElse(null) : null;
        String role    = job != null ? job.getRole()            : "Software Developer Intern";
        String company = job != null ? job.getCompanyName()     : "the company";
        String skills  = job != null && job.getSkillsRequired() != null ? job.getSkillsRequired() : "Java, Python";

        List<Map<String, String>> questions = new ArrayList<>();

        addQ(questions, "Tell me about yourself.", "Summarize your education, key skills (" + skills + "), and why you are excited about " + role + " at " + company + ".", "General");
        addQ(questions, "Why do you want to intern at " + company + "?", "Research " + company + "'s products and culture. Mention specific aspects that excite you.", "General");
        addQ(questions, "What are your strengths and weaknesses?", "Strength: a skill relevant to " + role + ". Weakness: something genuine you are actively improving.", "General");
        addQ(questions, "Describe a challenging project you worked on.", "Use STAR method: Situation, Task, Action, Result. Highlight teamwork and problem-solving.", "General");
        addQ(questions, "Where do you see yourself in 5 years?", "Express a career goal aligned with your field and show ambition while staying realistic.", "General");
        addQ(questions, "How do you handle tight deadlines?", "Give a real example of prioritizing tasks, communicating with teammates, and delivering on time.", "General");

        for (String skill : skills.split(",")) {
            String s = skill.trim().toLowerCase();
            if (s.isBlank()) continue;
            if (s.contains("java"))       addQ(questions, "Explain interface vs abstract class in Java.", "Cover default methods (Java 8+), multiple inheritance, and when to use each.", "Technical");
            else if (s.contains("react")) addQ(questions, "What is the virtual DOM and how does React use it?", "Explain reconciliation, diffing, and why it improves performance.", "Technical");
            else if (s.contains("python"))addQ(questions, "What are Python decorators?", "Explain function wrapping, @staticmethod, @classmethod, and real-world use cases.", "Technical");
            else if (s.contains("sql"))   addQ(questions, "Difference between INNER JOIN and LEFT JOIN?", "INNER returns only matching rows. LEFT keeps all rows from left table.", "Technical");
            else if (s.contains("node"))  addQ(questions, "Explain the Node.js event loop.", "Cover single-threaded nature, non-blocking I/O, call stack, and event queue.", "Technical");
            else                          addQ(questions, "Walk me through a project where you used " + skill.trim() + ".", "Describe problem, approach, what you built, and the outcome.", "Technical");
        }

        addQ(questions, "Are you comfortable working in a remote team?", "Mention Git, Slack, Zoom. Give a real remote collaboration example.", "HR");
        addQ(questions, "Do you have any questions for us?", "Always ask something — team culture, tech stack, growth opportunities. Never say no.", "HR");

        res.put("success",   true);
        res.put("role",      role);
        res.put("company",   company);
        res.put("questions", questions);
        res.put("tips", List.of(
                "Research " + company + " thoroughly before the interview",
                "Prepare 2-3 project examples using the STAR method",
                "Practice speaking answers aloud — timing matters",
                "Dress professionally even for online interviews",
                "Keep your camera on and maintain eye contact"
        ));
        return res;
    }

    // ── Job Match Score ────────────────────────────────────────────────────────
    public Map<String, Object> getJobMatchScore(String email, Long internshipId) {
        Map<String, Object> res = new HashMap<>();
        User user = userRepository.findByEmail(email).orElse(null);
        Internship job = internshipRepository.findById(internshipId).orElse(null);
        if (user == null || job == null) { res.put("success", false); res.put("message", "Not found"); return res; }

        String uSkillsStr = user.getSkills() != null ? user.getSkills().toLowerCase() : "";
        String jSkillsStr = job.getSkillsRequired() != null ? job.getSkillsRequired().toLowerCase() : "";
        String bio = (user.getBio() != null ? user.getBio() : "").toLowerCase();

        List<String> jList = Arrays.stream(jSkillsStr.split(",")).map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toList());
        List<String> uList = Arrays.stream(uSkillsStr.split(",")).map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toList());

        List<String> matched = jList.stream().filter(j -> uList.stream().anyMatch(u -> u.contains(j) || j.contains(u)) || bio.contains(j)).collect(Collectors.toList());
        List<String> missing = jList.stream().filter(j -> !matched.contains(j)).collect(Collectors.toList());

        double skillScore   = jList.isEmpty() ? 100 : Math.round(matched.size() * 100.0 / jList.size() * 10) / 10.0;
        int    profileBonus = (user.getProfileCompletion() != null ? user.getProfileCompletion() : 0) / 10;
        int    resumeBonus  = user.getResumePath() != null && !user.getResumePath().isBlank() ? 5 : 0;
        double total        = Math.min(100, Math.round((skillScore * 0.7 + profileBonus + resumeBonus) * 10) / 10.0);

        String verdict, color;
        if (total >= 80)      { verdict = "Excellent Match! Apply Now";          color = "#22c55e"; }
        else if (total >= 60) { verdict = "Good Match — Worth Applying";          color = "#7c6bff"; }
        else if (total >= 40) { verdict = "Moderate Match — Upskill First";       color = "#f59e0b"; }
        else                  { verdict = "Low Match — Improve Your Profile";     color = "#ef4444"; }

        List<String> suggestions = new ArrayList<>();
        if (!missing.isEmpty())   suggestions.add("Learn: " + missing.stream().limit(3).collect(Collectors.joining(", ")));
        if (profileBonus < 8)     suggestions.add("Complete your profile to 80% for a match score boost");
        if (resumeBonus == 0)     suggestions.add("Upload your resume for +5 score bonus");
        if (user.getBio() == null || user.getBio().isBlank()) suggestions.add("Add a bio describing your interests");
        if (suggestions.isEmpty()) suggestions.add("Great profile! Apply with confidence.");

        res.put("success",       true);
        res.put("score",         total);
        res.put("skillScore",    skillScore);
        res.put("verdict",       verdict);
        res.put("verdictColor",  color);
        res.put("matchedSkills", matched);
        res.put("missingSkills", missing);
        res.put("profileBonus",  profileBonus);
        res.put("resumeBonus",   resumeBonus);
        res.put("suggestions",   suggestions);
        return res;
    }

    // ── Resume Parser ──────────────────────────────────────────────────────────
    public Map<String, Object> parseResume(MultipartFile file, String email) {
        Map<String, Object> res = new HashMap<>();
        try {
            String text = new String(file.getBytes(), "UTF-8").replaceAll("[^\\x20-\\x7E\\n]", " ").replaceAll("\\s+", " ");
            Map<String, Object> parsed = new HashMap<>();

            String name     = extractFirstName(text);
            String pEmail   = extractPattern(text, "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}");
            String phone    = extractPattern(text, "(?:\\+91[\\s\\-]?)?[6-9]\\d{9}");
            String college  = extractField(text, new String[]{"university","college","institute"});
            String degree   = extractDegree(text);
            String skills   = extractSkills(text);
            String linkedin = extractPattern(text, "linkedin\\.com/in/[a-zA-Z0-9\\-_]+");
            String github   = extractPattern(text, "github\\.com/[a-zA-Z0-9\\-_]+");

            parsed.put("name",       name);
            parsed.put("email",      pEmail.isBlank() ? email : pEmail);
            parsed.put("phone",      phone);
            parsed.put("college",    college);
            parsed.put("degree",     degree);
            parsed.put("skills",     skills);
            parsed.put("linkedinUrl",linkedin.isBlank() ? "" : "https://" + linkedin);
            parsed.put("githubUrl",  github.isBlank()   ? "" : "https://" + github);

            userRepository.findByEmail(email).ifPresent(u -> {
                if (!phone.isBlank())    u.setPhone(phone);
                if (!college.isBlank())  u.setCollege(college);
                if (!degree.isBlank())   u.setDegree(degree);
                if (!skills.isBlank())   u.setSkills(skills);
                if (!linkedin.isBlank()) u.setLinkedinUrl("https://" + linkedin);
                if (!github.isBlank())   u.setGithubUrl("https://" + github);
                userRepository.save(u);
            });

            res.put("success", true);
            res.put("parsed",  parsed);
            res.put("message", "Resume parsed! Profile updated with extracted data.");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Parse failed: " + e.getMessage());
        }
        return res;
    }

    // ── Chatbot ────────────────────────────────────────────────────────────────
    public Map<String, Object> chatbotReply(String question) {
        Map<String, Object> res = new HashMap<>();
        String q = question.toLowerCase().trim();
        String reply;

        if      (match(q,"apply","how","where"))        reply = "Go to Explore → find an internship → click Apply Now → write a cover letter → Submit! Track applications on My Applications.";
        else if (match(q,"resume","upload"))             reply = "Go to Profile → Resume & Photo tab → drag and drop your PDF → click Upload Resume. It attaches to all applications automatically!";
        else if (match(q,"forgot","password") || match(q,"reset","password")) reply = "Click Forgot Password on the login page → enter email → enter the OTP you receive → set new password.";
        else if (match(q,"2fa","two factor","2 factor")) reply = "Enable 2FA in Profile → Security Settings. Each login will require a 6-digit code sent to your email for extra security.";
        else if (match(q,"badge","point"))               reply = "Earn points by applying (10 pts), uploading resume (20 pts), completing profile (50 pts), referring friends (30 pts). Check Gamification → How to Earn for all actions!";
        else if (q.contains("streak"))                   reply = "A streak counts consecutive days you apply. Apply every day to maintain it! 3 days = Hot Streak badge, 7 days = Week Warrior badge.";
        else if (match(q,"referral","refer"))            reply = "Go to Features → Referral to find your unique code. Share it — when friends register with your code you earn 30 points!";
        else if (match(q,"withdraw","cancel"))           reply = "Go to My Applications → find the application → click Withdraw. Note: you cannot re-apply after withdrawing.";
        else if (match(q,"save","bookmark"))             reply = "Click the ☆ icon on any internship card to save it. View saved internships on the Saved page in the navbar.";
        else if (q.contains("interview"))                reply = "When shortlisted, admin schedules an interview and you get an email with date, time, mode, and meeting link. Check My Applications for updates.";
        else if (match(q,"certificate","upload cert"))   reply = "Go to Features → Certificate Upload. Each certificate earns the Certified badge and 25 points!";
        else if (q.contains("notification"))             reply = "The 🔔 bell in the navbar shows unread notifications about application updates, interviews, and messages.";
        else if (match(q,"delete","account"))            reply = "Go to Profile → Security → Request Account Deletion. Account deleted in 7 days. You can cancel anytime before that.";
        else if (match(q,"hello","hi","hey"))            reply = "Hi there! 👋 I am InternHub Assistant. Ask me about applying, profile setup, badges, streaks, 2FA, or anything else!";
        else if (q.contains("thank"))                    reply = "You are welcome! 😊 Good luck with your internship search!";
        else if (match(q,"chat","message"))              reply = "Use the 💬 Chat icon in the navbar to directly message the admin with questions about applications or internships.";
        else if (match(q,"cover letter","coverletter"))  reply = "Go to any internship detail page → click Apply Now → you can write a custom cover letter or use the AI Cover Letter Generator on the Features page!";
        else                                             reply = "I am not sure about that. Try asking about: applying, resume upload, 2FA, badges, streaks, referrals, withdrawing, or notifications. What else can I help with?";

        res.put("success", true);
        res.put("reply",   reply);
        return res;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    private void addQ(List<Map<String,String>> list, String q, String tip, String type) {
        Map<String,String> m = new HashMap<>();
        m.put("question", q); m.put("tip", tip); m.put("type", type);
        list.add(m);
    }

    private boolean match(String text, String... words) {
        return Arrays.stream(words).allMatch(text::contains);
    }

    private String extractPattern(String text, String regex) {
        try {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile(regex, java.util.regex.Pattern.CASE_INSENSITIVE).matcher(text);
            if (m.find()) return m.group().trim();
        } catch (Exception ignored) {}
        return "";
    }

    private String extractFirstName(String text) {
        for (String line : text.split("\n")) {
            line = line.trim();
            if (!line.isBlank() && line.length() < 50 && !line.contains("@") && !line.matches(".*\\d.*")) return line;
        }
        return "";
    }

    private String extractField(String text, String[] keywords) {
        String lower = text.toLowerCase();
        for (String kw : keywords) {
            int idx = lower.indexOf(kw);
            if (idx >= 0) {
                String after = text.substring(idx).replaceAll("[:\\-–]", "").trim();
                String line  = after.split("\n")[0].replace(kw, "").trim();
                if (!line.isBlank() && line.length() < 100) return line;
            }
        }
        return "";
    }

    private String extractDegree(String text) {
        String l = text.toLowerCase();
        if (l.contains("b.tech") || l.contains("btech"))  return "B.Tech";
        if (l.contains("b.e.")   || l.contains(" be "))   return "B.E.";
        if (l.contains("m.tech") || l.contains("mtech"))  return "M.Tech";
        if (l.contains("bca"))                             return "BCA";
        if (l.contains("mca"))                             return "MCA";
        if (l.contains("mba"))                             return "MBA";
        if (l.contains("b.sc")   || l.contains("bsc"))    return "B.Sc";
        return "";
    }

    private String extractSkills(String text) {
        String lower = text.toLowerCase();
        int idx = lower.indexOf("skill");
        if (idx < 0) idx = lower.indexOf("technical");
        if (idx >= 0) {
            String section = text.substring(idx, Math.min(idx + 400, text.length()));
            String cleaned = section.replaceAll("[•\\-*|]", ",").replaceAll("\\s+", " ").trim();
            if (cleaned.length() > 5) return cleaned.substring(0, Math.min(300, cleaned.length()));
        }
        List<String> common = List.of("Java","Python","JavaScript","React","Node","SQL","HTML","CSS","Spring","Git","Docker","AWS","C++","TypeScript","Figma","Kotlin","Swift");
        return common.stream().filter(s -> lower.contains(s.toLowerCase())).collect(Collectors.joining(", "));
    }
}
