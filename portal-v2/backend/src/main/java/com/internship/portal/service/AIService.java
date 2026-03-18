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
        String q = question.toLowerCase().trim()
                .replace("?","").replace("!","").replace(",","").trim();
        String reply = findReply(q);
        res.put("success", true);
        res.put("reply",   reply);
        return res;
    }

    private String findReply(String q) {
        // Greetings
        if (has(q,"hello") || has(q,"hi") || has(q,"hey") || has(q,"helo") || has(q,"hii"))
            return "Hi there! 👋 I am InternHub AI Assistant. I can help you with applying to internships, profile setup, badges, streaks, 2FA security, cover letters, and much more. What would you like to know?";

        if (has(q,"thank") || has(q,"thanks") || has(q,"thx"))
            return "You're welcome! 😊 Good luck with your internship search! Feel free to ask anything else.";

        if (has(q,"good") && has(q,"morning") || has(q,"good") && has(q,"evening") || has(q,"good") && has(q,"afternoon"))
            return "Hello! 👋 Hope you're having a great day. How can I help you with InternHub today?";

        // Applying
        if (has(q,"how") && has(q,"apply") || has(q,"apply") && has(q,"internship") || has(q,"how to apply") || q.equals("apply"))
            return "Here's how to apply:\n1️⃣ Go to the Explore page\n2️⃣ Find an internship you like\n3️⃣ Click on it to open details\n4️⃣ Click the 'Apply Now' button\n5️⃣ Write a cover letter (optional)\n6️⃣ Click Submit!\n\nYou can track all your applications on the My Applications page in the navbar.";

        if (has(q,"application") && has(q,"status") || has(q,"track") && has(q,"application"))
            return "Go to My Applications in the navbar. Each application shows its current status:\n🔵 Applied → Under Review → Shortlisted → Interview Scheduled → ✅ Accepted / ❌ Rejected\n\nYou also get email notifications and in-app notifications every time the status changes.";

        if (has(q,"withdraw") || has(q,"cancel") && has(q,"application"))
            return "To withdraw an application:\n1️⃣ Go to My Applications\n2️⃣ Find the application\n3️⃣ Click the Withdraw button\n\n⚠️ Note: Once withdrawn, you cannot re-apply for the same internship.";

        if (has(q,"cover letter") || has(q,"coverletter") || has(q,"cover") && has(q,"letter"))
            return "You can write a cover letter two ways:\n✍️ Manual: When applying, type your cover letter in the text box\n🤖 AI: Go to AI Features → Cover Letter tab → select internship → choose tone → click Generate!\n\nThe AI generator uses your profile skills and the job requirements to write a personalized letter automatically.";

        // Resume
        if (has(q,"upload") && has(q,"resume") || has(q,"resume") && has(q,"upload") || has(q,"how") && has(q,"resume"))
            return "To upload your resume:\n1️⃣ Go to Profile (navbar)\n2️⃣ Click the 'Resume & Photo' tab\n3️⃣ Drag and drop your PDF file onto the upload zone (or click to browse)\n4️⃣ Click Upload Resume\n\n✅ Your resume automatically attaches to every application you submit!";

        if (has(q,"resume") && has(q,"parse") || has(q,"parse") && has(q,"resume") || has(q,"auto") && has(q,"fill") || has(q,"resume") && has(q,"scan"))
            return "The Resume Parser auto-fills your profile!\n1️⃣ Go to AI Features → Resume Parser tab\n2️⃣ Drop your resume file\n3️⃣ Click 'Parse & Update Profile'\n\nIt automatically extracts your name, phone, college, degree, skills, LinkedIn, and GitHub from the resume and saves everything to your profile instantly!";

        if (has(q,"resume") && has(q,"score") || has(q,"score") && has(q,"resume"))
            return "The AI Resume Score analyzes your resume and gives a score out of 100.\n\nGo to Features → Resume Score tab → upload your resume → get instant feedback with:\n✅ Strengths list\n💡 Areas to improve\n📊 Score breakdown\n\nScoring 70+ earns you the Resume Scorer badge and 25 points!";

        // Profile
        if (has(q,"profile") && has(q,"complete") || has(q,"complete") && has(q,"profile") || has(q,"profile") && has(q,"percent"))
            return "Profile completion is scored like this:\n📝 Name — 15%\n📖 Bio — 15%\n🛠 Skills — 15%\n🏫 College — 10%\n🎓 Degree — 10%\n📞 Phone — 10%\n📄 Resume — 15%\n📷 Photo — 10%\n\nReaching 80% earns the Profile Pro badge + 50 points! Go to Profile to update everything.";

        if (has(q,"update") && has(q,"profile") || has(q,"edit") && has(q,"profile") || has(q,"change") && has(q,"name") || has(q,"change") && has(q,"bio"))
            return "To update your profile:\n1️⃣ Click Profile in the navbar\n2️⃣ Personal Info tab — update name, phone, college, degree, graduation year\n3️⃣ Skills & Links tab — add skills (comma-separated), LinkedIn, GitHub\n4️⃣ Resume & Photo tab — upload resume or profile photo\n5️⃣ Click Save Changes\n\nKeep your profile complete for better job match scores!";

        if (has(q,"skill") && (has(q,"add") || has(q,"update") || has(q,"edit")))
            return "To add or update skills:\n1️⃣ Go to Profile\n2️⃣ Click 'Skills & Links' tab\n3️⃣ Type your skills separated by commas (e.g. React, Java, Python, Figma)\n4️⃣ Click Save Changes\n\nYour skills are used for AI job matching, resume scoring, and internship recommendations!";

        // Badges and Points
        if (has(q,"badge") || has(q,"earn") && has(q,"badge"))
            return "There are 12 badges to earn:\n🎯 First Step — first application\n🔭 Explorer — 5 applications\n🚀 Go-Getter — 10 applications\n⭐ Profile Pro — 80% profile\n📄 Resume Ready — upload resume\n🏅 Resume Scorer — score 70+\n🤝 Connector — refer 1 friend\n💎 Super Connector — refer 5 friends\n🎉 Accepted! — get accepted\n🎤 Interview Star — get shortlisted\n📜 Certified — upload certificate\n💼 Portfolio Star — add portfolio\n\nEach badge earns +50 bonus points! View them on the Gamification page.";

        if (has(q,"point") || has(q,"earn") && has(q,"point") || has(q,"how") && has(q,"point"))
            return "Here's how to earn points:\n📝 Apply to internship — +10 pts\n📄 Upload resume — +20 pts\n⭐ Complete profile 80% — +50 pts\n🤝 Refer a friend — +30 pts\n📜 Upload certificate — +25 pts\n💬 Write a review — +15 pts\n🏅 Earn any badge — +50 pts\n🔥 Daily streak bonus — +5×day pts\n\nPoints determine your level: Bronze → Silver → Gold → Platinum → Diamond!";

        if (has(q,"level") || has(q,"bronze") || has(q,"gold") || has(q,"diamond") || has(q,"rank"))
            return "The 5 levels based on points:\n🥉 Bronze — 0 to 74 pts\n🥈 Silver — 75 to 149 pts\n🥇 Gold — 150 to 299 pts\n💎 Platinum — 300 to 499 pts\n💠 Diamond — 500+ pts\n\nCheck your current level and progress bar on the 🏆 Gamification page!";

        if (has(q,"leaderboard") || has(q,"top") && has(q,"student") || has(q,"ranking"))
            return "The Leaderboard shows the top 20 students ranked by total points!\n\nGo to 🏆 Gamification → Leaderboard tab\n\nYou can see everyone's level, streak, and badge count. Your row is highlighted in purple so you can quickly find your rank.";

        // Streak
        if (has(q,"streak"))
            return "A streak counts how many consecutive days you apply for internships!\n\n🔥 Apply today → streak = 1\n🔥🔥 Apply tomorrow too → streak = 2\n❌ Miss a day → streak resets to 1\n\nStreak badges:\n🔥 Hot Streak — 3 days in a row\n⚔️ Week Warrior — 7 days in a row\n💥 Unstoppable — 30 days in a row\n\nYou also earn bonus points = 5 × streak days per application!";

        // Referral
        if (has(q,"referral") || has(q,"refer") || has(q,"invite") || has(q,"referral code"))
            return "The referral system lets you earn points by inviting friends!\n\n1️⃣ Go to Features → Referral section\n2️⃣ Find your unique referral code (e.g. RAHUL1234)\n3️⃣ Share the link with friends\n4️⃣ When they register using your code → you earn 30 points!\n5️⃣ 1 referral = 🤝 Connector badge, 5 referrals = 💎 Super Connector badge!";

        // Save / Bookmark
        if (has(q,"save") && has(q,"internship") || has(q,"bookmark") || has(q,"saved"))
            return "To save/bookmark an internship:\n⭐ Click the ☆ star icon on any internship card on the Dashboard\n⭐ Or click Save on the internship detail page\n\nView all your saved internships by clicking 'Saved' in the navbar. Bookmarks are stored in your account permanently.";

        // Interview
        if (has(q,"interview") && (has(q,"schedule") || has(q,"when") || has(q,"prepare") || has(q,"prep")))
            return "Once you're shortlisted, the admin schedules an interview. You'll receive:\n📧 Email with date, time, and meeting link\n🔔 In-app notification\n\nFor interview preparation, go to 🤖 AI Features → Interview Prep tab — select the internship and get custom practice questions with tips!";

        if (has(q,"interview") || has(q,"interview prep") || has(q,"practice") && has(q,"interview"))
            return "Prepare for interviews using AI!\n\nGo to AI Features → Interview Prep tab:\n1️⃣ Select the internship you're interviewing for\n2️⃣ Click Get Questions\n3️⃣ Get role-specific questions (General, Technical, HR)\n4️⃣ Click any question to see answer tips\n\nQuestions are tailored to the exact skills required for the role!";

        // 2FA / Security
        if (has(q,"2fa") || has(q,"two factor") || has(q,"two-factor") || has(q,"2 factor"))
            return "2FA (Two-Factor Authentication) adds extra security to your account!\n\nTo enable:\n1️⃣ Click the 🔒 icon in the navbar\n2️⃣ Click 'Enable 2FA'\n3️⃣ Done!\n\nNext login: enter password → receive 6-digit code on email → enter code → you're in!\n\n🔒 Even if someone knows your password, they can't login without the code.";

        if (has(q,"forgot") && has(q,"password") || has(q,"reset") && has(q,"password") || has(q,"password") && has(q,"change"))
            return "To reset your password:\n1️⃣ Go to the Login page\n2️⃣ Click 'Forgot password?'\n3️⃣ Enter your email\n4️⃣ Check your email for a 6-digit OTP (also printed in IntelliJ console)\n5️⃣ Enter the OTP\n6️⃣ Set your new password\n\nThe OTP expires in 10 minutes!";

        if (has(q,"remember me") || has(q,"stay logged") || has(q,"keep logged") || has(q,"session"))
            return "On the login page, check ✅ 'Remember me (30 days)' to stay logged in for 30 days!\n\nWithout it, your session expires after 24 hours and you'll need to log in again.\n\nYour JWT token is stored securely in browser localStorage.";

        if (has(q,"delete") && has(q,"account") || has(q,"delete") && has(q,"profile"))
            return "To request account deletion:\n1️⃣ Click 🔒 Security in the navbar\n2️⃣ Scroll to 'Account Deletion'\n3️⃣ Click 'Request Account Deletion'\n4️⃣ Confirm the prompt\n\nYour account will be permanently deleted in 7 days. You can cancel anytime by clicking 'Cancel Deletion Request' before the 7 days are up.";

        if (has(q,"login") && has(q,"history") || has(q,"login history") || has(q,"last login"))
            return "View your login history on the 🔒 Security Settings page.\n\nIt shows the last 5 logins with:\n🖥 Device type (Windows, Mac, Mobile)\n🕐 Date and time\n✅ Current session is marked green\n\nThis helps you spot any suspicious logins from unknown devices!";

        // Notifications
        if (has(q,"notification") || has(q,"bell") || has(q,"alert"))
            return "Notifications keep you updated on everything!\n\n🔔 The bell icon in the navbar shows unread count.\n\nYou get notified when:\n📝 Application is reviewed\n⭐ You're shortlisted\n📅 Interview is scheduled\n✅ You're accepted\n❌ Application rejected\n💬 New chat message\n\nClick the bell to see all notifications and mark them as read.";

        // Chat
        if (has(q,"chat") || has(q,"message") && has(q,"admin") || has(q,"contact") && has(q,"admin"))
            return "You can message the admin directly!\n\n1️⃣ Click the 💬 Chat icon in the navbar\n2️⃣ You'll see your existing conversations on the left\n3️⃣ Click a contact or start a new chat\n4️⃣ Type your message and click Send\n\nMessages are delivered instantly. The chat badge shows unread message count. New messages appear every 3 seconds automatically!";

        // Announcements
        if (has(q,"announcement") || has(q,"notice") || has(q,"notice board") || has(q,"update") && has(q,"platform"))
            return "Check the 📢 Announcements page for important notices from admin!\n\nAnnouncements come in 4 types:\n📘 INFO — General information\n✅ SUCCESS — Good news\n⚠️ WARNING — Important alerts\n🚨 URGENT — Critical notices\n\nPinned announcements always stay at the top. Click 📢 in the navbar to view them!";

        // Certificate
        if (has(q,"certificate") || has(q,"upload") && has(q,"cert"))
            return "Upload your internship completion certificates!\n\n1️⃣ Go to Features → Certificate Upload\n2️⃣ Fill in company name, role, completion date\n3️⃣ Upload the PDF certificate\n4️⃣ Click Upload\n\n🏅 You earn the Certified badge + 25 points for each certificate uploaded!";

        // Portfolio
        if (has(q,"portfolio") || has(q,"project") && has(q,"add") || has(q,"github project"))
            return "Add your projects to your portfolio!\n\n1️⃣ Go to Features → Portfolio section\n2️⃣ Enter project title and URL\n3️⃣ Click Add\n\nProjects are shown on your profile. Adding at least one project earns the 💼 Portfolio Star badge + 50 points! You can add GitHub repos, deployed websites, or Figma designs.";

        // AI Features
        if (has(q,"ai") && has(q,"feature") || has(q,"ai feature") || has(q,"artificial intelligence"))
            return "InternHub has 5 AI-powered features:\n✍️ Cover Letter — auto-generate personalized letters\n🎤 Interview Prep — practice questions for your role\n🎯 Job Match Score — see how well you fit an internship\n📄 Resume Parser — auto-fill profile from resume\n🤖 AI Assistant — that's me! 😄\n\nGo to 🤖 AI in the navbar to access all of them!";

        if (has(q,"job match") || has(q,"match score") || has(q,"fit") && has(q,"internship") || has(q,"how") && has(q,"match"))
            return "The Job Match Score shows how well your profile matches an internship!\n\nGo to AI Features → Job Match Score tab:\n1️⃣ Select any internship\n2️⃣ Click 'Check My Match Score'\n3️⃣ See your score out of 100\n\nThe score is based on:\n🛠 Skill match (70% weight)\n📊 Profile completion bonus (+8 max)\n📄 Resume uploaded bonus (+5)\n\n80%+ = Excellent Match! Apply with confidence 🚀";

        // Trending / Recently viewed
        if (has(q,"trending") || has(q,"popular") && has(q,"internship"))
            return "The 🔥 Trending tab on the Dashboard shows internships getting the most views in the last 7 days!\n\nGo to Dashboard → click the '🔥 Trending' tab\n\nThese are the hottest opportunities right now. Apply quickly before they fill up!";

        if (has(q,"recently") && has(q,"viewed") || has(q,"history") && has(q,"internship") || has(q,"last viewed"))
            return "The 👁 Recently Viewed tab on Dashboard shows internships you visited recently!\n\nGo to Dashboard → click '👁 Recently Viewed' tab\n\nYour last 10 viewed internships are stored in your browser automatically. No need to search again for internships you were considering!";

        // Recommendations
        if (has(q,"recommendation") || has(q,"suggest") && has(q,"internship") || has(q,"recommend"))
            return "Get personalized internship recommendations based on your skills!\n\nGo to Features → Recommendations tab\n\nThe AI matches your skills against all active internships, scores them on:\n🛠 Skill overlap\n📂 Category match\n🏠 Remote preference\n💰 Stipend level\n\nTop matching internships are shown first. Update your skills in Profile for better recommendations!";

        // Gamification page
        if (has(q,"gamification") || has(q,"game") && has(q,"feature"))
            return "The 🏆 Gamification page has everything about your progress:\n\n🎯 My Profile tab — level, points, streak display, earned badges\n🏅 Leaderboard tab — top 20 students by points\n💰 How to Earn tab — full list of point actions and level thresholds\n\nClick 🏆 in the navbar to open it!";

        // Search / filter
        if (has(q,"filter") || has(q,"search") && has(q,"internship") || has(q,"find") && has(q,"internship"))
            return "Use advanced filters on the Dashboard to find the perfect internship!\n\nClick '🎛 Filters' button:\n🔍 Search by keyword (role/company)\n📍 Filter by location\n💰 Stipend range slider\n🏠 Work from home checkbox\n⏱ Part time only checkbox\n\nAlso sort by: Newest, Highest Stipend, Most Applied, Deadline, Most Viewed!\n\nAll filters work together instantly.";

        // Dark mode
        if (has(q,"dark mode") || has(q,"light mode") || has(q,"theme") || has(q,"dark") && has(q,"light"))
            return "Toggle between dark and light mode using the ☀️/🌙 button in the top-right of the navbar!\n\nDark mode is the default. Your preference is saved in the browser and remembered next time you visit.";

        // Logout / login
        if (has(q,"logout") || has(q,"log out") || has(q,"sign out"))
            return "To logout, click the 'Logout' button at the top-right of the navbar.\n\nYour session data is cleared from the browser. If you enabled 'Remember Me', re-login will be quick with your saved credentials.";

        if (has(q,"login") || has(q,"log in") || has(q,"sign in") || has(q,"cant login") || has(q,"cannot login"))
            return "To login:\n1️⃣ Go to the Login page\n2️⃣ Enter your email and password\n3️⃣ Optionally check 'Remember me'\n4️⃣ Click Sign In\n\nProblems logging in?\n🔑 Forgot password → click 'Forgot password?' link\n📧 Not verified → check email for OTP\n🔐 2FA enabled → enter the code sent to email\n🚫 Account banned → contact admin via Announcements";

        if (has(q,"register") || has(q,"sign up") || has(q,"create account") || has(q,"new account"))
            return "To register a new account:\n1️⃣ Click Register on the login page\n2️⃣ Fill in name, email, password, role\n3️⃣ Click Register\n4️⃣ Enter the OTP sent to your email (also shown in IntelliJ console for testing)\n5️⃣ Account verified → Login!\n\n💡 If you have a referral code from a friend, enter it during registration to help them earn points!";

        // Company
        if (has(q,"company") && has(q,"profile") || has(q,"company") && has(q,"review") || has(q,"company") && has(q,"rating"))
            return "Each company has a profile page showing:\n🏢 About section and culture\n🌐 Website and social links\n🎁 Perks and benefits\n⭐ Average rating from students\n💬 Student reviews\n\nTo write a review: open any internship from that company → scroll down → click 'Write Review' → rate and share your experience!";

        // Fallback with smart suggestions
        String[] keywords = q.split("\\s+");
        String suggestion = keywords.length > 0 ? keywords[0] : "internships";
        return "I'm not sure about that specific question. Here are things I can help with:\n\n" +
                "📝 Applying — 'How do I apply?'\n" +
                "👤 Profile — 'How to complete my profile?'\n" +
                "🏅 Badges — 'How do I earn badges?'\n" +
                "🔥 Streak — 'What is a streak?'\n" +
                "🤖 AI Tools — 'What are the AI features?'\n" +
                "🔒 Security — 'How to enable 2FA?'\n" +
                "💬 Chat — 'How to message admin?'\n" +
                "🎯 Job Match — 'How is job match score calculated?'\n\n" +
                "Just type your question naturally and I'll do my best to help! 😊";
    }

    private boolean has(String text, String word) {
        return text.contains(word);
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