package com.internship.portal.service;

import com.internship.portal.model.Badge;
import com.internship.portal.model.User;
import com.internship.portal.repository.BadgeRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    @Autowired private UserRepository  userRepository;
    @Autowired private BadgeRepository badgeRepository;

    // Points config
    public static final int POINTS_APPLY           = 10;
    public static final int POINTS_PROFILE_COMPLETE = 50;
    public static final int POINTS_RESUME_UPLOAD    = 20;
    public static final int POINTS_REFERRAL         = 30;
    public static final int POINTS_CERTIFICATE      = 25;
    public static final int POINTS_REVIEW           = 15;
    public static final int POINTS_STREAK_BONUS     = 5;   // per streak day bonus

    public Map<String, Object> getProfile(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); return res; }
        User user = opt.get();

        res.put("success",       true);
        res.put("points",        user.getPoints() == null ? 0 : user.getPoints());
        res.put("streakDays",    user.getStreakDays() == null ? 0 : user.getStreakDays());
        res.put("longestStreak", user.getLongestStreak() == null ? 0 : user.getLongestStreak());
        res.put("lastApplied",   user.getLastApplied());
        res.put("badgeCount",    user.getBadgeCount() == null ? 0 : user.getBadgeCount());
        res.put("badges",        badgeRepository.findByStudentEmail(email));
        res.put("level",         getLevel(user.getPoints() == null ? 0 : user.getPoints()));
        res.put("nextLevelPoints", getNextLevelPoints(user.getPoints() == null ? 0 : user.getPoints()));
        return res;
    }

    public void awardPoints(String email, int points, String reason) {
        userRepository.findByEmail(email).ifPresent(user -> {
            int current = user.getPoints() == null ? 0 : user.getPoints();
            user.setPoints(current + points);
            userRepository.save(user);
        });
    }

    public void updateStreak(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            LocalDate today = LocalDate.now();
            LocalDate last  = user.getLastApplied();

            int streak = user.getStreakDays() == null ? 0 : user.getStreakDays();

            if (last == null) {
                // First application ever
                streak = 1;
            } else if (last.equals(today)) {
                // Already applied today — no change
                return;
            } else if (last.equals(today.minusDays(1))) {
                // Applied yesterday — extend streak
                streak++;
                // Streak bonus points
                awardPoints(email, POINTS_STREAK_BONUS * (Math.min(streak, 7)), "Streak bonus");
            } else {
                // Streak broken
                streak = 1;
            }

            user.setStreakDays(streak);
            user.setLastApplied(today);
            if (streak > (user.getLongestStreak() == null ? 0 : user.getLongestStreak())) {
                user.setLongestStreak(streak);
            }
            userRepository.save(user);

            // Badge for streaks
            checkStreakBadges(email, streak);
        });
    }

    private void checkStreakBadges(String email, int streak) {
        if (streak >= 3)  awardBadge(email, "Hot Streak",   "🔥", "Applied 3 days in a row");
        if (streak >= 7)  awardBadge(email, "Week Warrior", "⚔️", "Applied 7 days in a row");
        if (streak >= 30) awardBadge(email, "Unstoppable",  "💥", "Applied 30 days in a row");
    }

    public List<Map<String, Object>> getLeaderboard() {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.STUDENT && !u.isBanned())
                .sorted((a, b) -> Integer.compare(
                        b.getPoints() == null ? 0 : b.getPoints(),
                        a.getPoints() == null ? 0 : a.getPoints()))
                .limit(20)
                .collect(Collectors.toList());

        List<Map<String, Object>> board = new ArrayList<>();
        int rank = 1;
        for (User u : students) {
            Map<String, Object> row = new HashMap<>();
            row.put("rank",       rank++);
            row.put("name",       u.getName());
            row.put("email",      u.getEmail());
            row.put("points",     u.getPoints() == null ? 0 : u.getPoints());
            row.put("badges",     u.getBadgeCount() == null ? 0 : u.getBadgeCount());
            row.put("streak",     u.getStreakDays() == null ? 0 : u.getStreakDays());
            row.put("level",      getLevel(u.getPoints() == null ? 0 : u.getPoints()));
            row.put("college",    u.getCollege());
            board.add(row);
        }
        return board;
    }

    private void awardBadge(String email, String name, String icon, String desc) {
        if (badgeRepository.existsByStudentEmailAndBadgeName(email, name)) return;
        Badge b = Badge.create(email, name, icon, desc);
        badgeRepository.save(b);
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setBadgeCount((u.getBadgeCount() == null ? 0 : u.getBadgeCount()) + 1);
            userRepository.save(u);
        });
    }

    public String getLevel(int points) {
        if (points >= 500) return "Diamond";
        if (points >= 300) return "Platinum";
        if (points >= 150) return "Gold";
        if (points >= 75)  return "Silver";
        return "Bronze";
    }

    public int getNextLevelPoints(int points) {
        if (points < 75)  return 75;
        if (points < 150) return 150;
        if (points < 300) return 300;
        if (points < 500) return 500;
        return 500;
    }
}
