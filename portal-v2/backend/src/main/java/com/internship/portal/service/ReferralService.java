package com.internship.portal.service;

import com.internship.portal.model.User;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReferralService {

    @Autowired private UserRepository userRepository;
    @Autowired private BadgeService badgeService;

    private String generateCode(String name) {
        String base = name.replaceAll("\\s+", "").toUpperCase();
        if (base.length() > 6) base = base.substring(0, 6);
        return base + String.format("%04d", new Random().nextInt(9999));
    }

    public Map<String, Object> getReferralInfo(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); return res; }

        User user = opt.get();

        // Generate code if not exists
        if (user.getReferralCode() == null || user.getReferralCode().isBlank()) {
            user.setReferralCode(generateCode(user.getName()));
            userRepository.save(user);
        }

        res.put("success",       true);
        res.put("referralCode",  user.getReferralCode());
        res.put("referralCount", user.getReferralCount() == null ? 0 : user.getReferralCount());
        res.put("referralLink",  "http://localhost:3000/register?ref=" + user.getReferralCode());
        return res;
    }

    public Map<String, Object> applyReferral(String newUserEmail, String referralCode) {
        Map<String, Object> res = new HashMap<>();
        if (referralCode == null || referralCode.isBlank()) {
            res.put("success", false);
            return res;
        }

        // Find the referrer by their code
        Optional<User> referrerOpt = userRepository.findAll().stream()
                .filter(u -> referralCode.equalsIgnoreCase(u.getReferralCode()))
                .findFirst();

        if (referrerOpt.isEmpty()) {
            res.put("success", false);
            res.put("message", "Invalid referral code");
            return res;
        }

        User referrer = referrerOpt.get();
        int count = referrer.getReferralCount() == null ? 0 : referrer.getReferralCount();
        referrer.setReferralCount(count + 1);
        // Give referrer points
        int pts = referrer.getPoints() == null ? 0 : referrer.getPoints();
        referrer.setPoints(pts + 100);
        userRepository.save(referrer);

        // Check and award badges for referrer
        badgeService.checkAndAward(referrer.getEmail());

        // Save referral code on new user
        userRepository.findByEmail(newUserEmail).ifPresent(u -> {
            u.setReferralCode(u.getReferralCode() == null ? null : u.getReferralCode());
            userRepository.save(u);
        });

        res.put("success", true);
        res.put("message", "Referral applied! " + referrer.getName() + " gets credit.");
        return res;
    }
}
