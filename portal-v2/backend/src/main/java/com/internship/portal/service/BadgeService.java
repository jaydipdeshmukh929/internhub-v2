package com.internship.portal.service;

import com.internship.portal.model.Badge;
import com.internship.portal.model.User;
import com.internship.portal.repository.ApplicationRepository;
import com.internship.portal.repository.BadgeRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BadgeService {

    @Autowired private BadgeRepository       badgeRepository;
    @Autowired private UserRepository        userRepository;
    @Autowired private ApplicationRepository applicationRepository;

    private static final Map<String, String[]> BADGE_DEFS = new LinkedHashMap<>();
    static {
        BADGE_DEFS.put("First Step",      new String[]{"🎯", "Submitted your first application"});
        BADGE_DEFS.put("Explorer",        new String[]{"🔭", "Applied to 5 internships"});
        BADGE_DEFS.put("Go-Getter",       new String[]{"🚀", "Applied to 10 internships"});
        BADGE_DEFS.put("Profile Pro",     new String[]{"⭐", "Reached 80% profile completion"});
        BADGE_DEFS.put("Resume Ready",    new String[]{"📄", "Uploaded your resume"});
        BADGE_DEFS.put("Connector",       new String[]{"🤝", "Referred a friend to InternHub"});
        BADGE_DEFS.put("Super Connector", new String[]{"💎", "Referred 5 friends to InternHub"});
        BADGE_DEFS.put("Accepted!",       new String[]{"🎉", "Got accepted to an internship"});
        BADGE_DEFS.put("Interview Star",  new String[]{"🎤", "Shortlisted for an interview"});
        BADGE_DEFS.put("Certified",       new String[]{"📜", "Uploaded a completion certificate"});
        BADGE_DEFS.put("Portfolio Star",  new String[]{"💼", "Added projects to your portfolio"});
        BADGE_DEFS.put("Resume Scorer",   new String[]{"🏅", "Got a resume score of 70+"});
    }

    public void checkAndAward(String email) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) return;
        User user = opt.get();

        long appCount = applicationRepository.findByStudentEmail(email).size();

        if (appCount >= 1)  award(email, "First Step");
        if (appCount >= 5)  award(email, "Explorer");
        if (appCount >= 10) award(email, "Go-Getter");

        if (user.getProfileCompletion() != null && user.getProfileCompletion() >= 80)
            award(email, "Profile Pro");

        if (user.getResumePath() != null && !user.getResumePath().isBlank())
            award(email, "Resume Ready");

        if (user.getResumeScore() != null && user.getResumeScore() >= 70)
            award(email, "Resume Scorer");

        if (user.getReferralCount() != null && user.getReferralCount() >= 1)
            award(email, "Connector");

        if (user.getReferralCount() != null && user.getReferralCount() >= 5)
            award(email, "Super Connector");

        if (user.getPortfolioLinks() != null
                && !user.getPortfolioLinks().isBlank()
                && !user.getPortfolioLinks().equals("[]"))
            award(email, "Portfolio Star");
    }

    public void awardAccepted(String email)    { award(email, "Accepted!");      }
    public void awardInterview(String email)   { award(email, "Interview Star"); }
    public void awardCertificate(String email) { award(email, "Certified");      }

    public List<Badge> getBadges(String email) {
        return badgeRepository.findByStudentEmail(email);
    }

    private void award(String email, String badgeName) {
        if (badgeRepository.existsByStudentEmailAndBadgeName(email, badgeName)) return;

        String[] def = BADGE_DEFS.get(badgeName);
        if (def == null) return;

        Badge badge = Badge.create(email, badgeName, def[0], def[1]);
        badgeRepository.save(badge);

        // Increment badgeCount on user
        userRepository.findByEmail(email).ifPresent(user -> {
            int count = user.getBadgeCount() == null ? 0 : user.getBadgeCount();
            user.setBadgeCount(count + 1);
            // Award 50 bonus points per badge
            int pts = user.getPoints() == null ? 0 : user.getPoints();
            user.setPoints(pts + 50);
            userRepository.save(user);
        });
    }
}
