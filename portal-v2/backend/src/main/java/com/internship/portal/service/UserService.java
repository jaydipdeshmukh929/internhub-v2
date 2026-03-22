package com.internship.portal.service;

import com.internship.portal.model.User;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private ReferralService referralService;
    @Value("${upload.dir}") private String uploadDir;

    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Map<String, Object> updateProfile(Map<String, Object> body) {
        Map<String, Object> res = new HashMap<>();
        String email = (String) body.get("email");
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); return res; }
        User user = opt.get();

        if (body.containsKey("name"))           user.setName((String) body.get("name"));
        if (body.containsKey("bio"))            user.setBio((String) body.get("bio"));
        if (body.containsKey("skills"))         user.setSkills((String) body.get("skills"));
        if (body.containsKey("college"))        user.setCollege((String) body.get("college"));
        if (body.containsKey("degree"))         user.setDegree((String) body.get("degree"));
        if (body.containsKey("phone"))          user.setPhone((String) body.get("phone"));
        if (body.containsKey("linkedinUrl"))    user.setLinkedinUrl((String) body.get("linkedinUrl"));
        if (body.containsKey("githubUrl"))      user.setGithubUrl((String) body.get("githubUrl"));
        if (body.containsKey("portfolioLinks")) user.setPortfolioLinks((String) body.get("portfolioLinks"));
        if (body.containsKey("graduationYear") && body.get("graduationYear") != null)
            user.setGraduationYear(Integer.valueOf(body.get("graduationYear").toString()));

        // Generate referral code if not set
        if (user.getReferralCode() == null || user.getReferralCode().isBlank()) {
            String code = referralService.generateReferralCode(user.getName());
            user.setReferralCode(code);
        }

        user.setProfileCompletion(calcCompletion(user));
        userRepository.save(user);
        res.put("success",           true);
        res.put("profileCompletion", user.getProfileCompletion());
        res.put("referralCode",      user.getReferralCode());
        return res;
    }

    // Change password (used by admin and student)
    public Map<String, Object> changePassword(String email, String currentPassword, String newPassword) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); res.put("message", "User not found"); return res; }
        User user = opt.get();

        if (!user.getPassword().equals(currentPassword)) {
            res.put("success", false);
            res.put("message", "Current password is incorrect");
            return res;
        }
        if (newPassword == null || newPassword.length() < 6) {
            res.put("success", false);
            res.put("message", "New password must be at least 6 characters");
            return res;
        }
        user.setPassword(newPassword);
        userRepository.save(user);
        res.put("success", true);
        res.put("message", "Password changed successfully!");
        return res;
    }

    // Delete account permanently
    public Map<String, Object> deleteAccount(String email, String password) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); res.put("message", "User not found"); return res; }
        User user = opt.get();

        // Verify password before deleting
        if (!user.getPassword().equals(password)) {
            res.put("success", false);
            res.put("message", "Incorrect password. Account not deleted.");
            return res;
        }
        userRepository.delete(user);
        res.put("success", true);
        res.put("message", "Account permanently deleted.");
        return res;
    }

    public Map<String, Object> uploadResume(String email, MultipartFile file) {
        Map<String, Object> res = new HashMap<>();
        try {
            String dir = uploadDir + "resumes/";
            new File(dir).mkdirs();
            String filename = email.replace("@", "_") + "_resume.pdf";
            Files.write(Paths.get(dir, filename), file.getBytes());
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setResumePath(dir + filename);
                user.setProfileCompletion(calcCompletion(user));
                userRepository.save(user);
            });
            res.put("success", true);
            res.put("path", filename);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> uploadPhoto(String email, MultipartFile file) {
        Map<String, Object> res = new HashMap<>();
        try {
            String dir = uploadDir + "photos/";
            new File(dir).mkdirs();
            String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.')) : ".jpg";
            String filename = email.replace("@", "_") + "_photo" + ext;
            Files.write(Paths.get(dir, filename), file.getBytes());
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setProfilePhoto(filename);
                user.setProfileCompletion(calcCompletion(user));
                userRepository.save(user);
            });
            res.put("success", true);
            res.put("filename", filename);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> banUser(Long id, boolean ban) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findById(id).ifPresent(u -> {
            u.setBanned(ban);
            userRepository.save(u);
        });
        res.put("success", true);
        return res;
    }

    private int calcCompletion(User u) {
        int score = 0;
        if (u.getName()        != null && !u.getName().isBlank())        score += 15;
        if (u.getBio()         != null && !u.getBio().isBlank())         score += 15;
        if (u.getSkills()      != null && !u.getSkills().isBlank())      score += 15;
        if (u.getCollege()     != null && !u.getCollege().isBlank())     score += 10;
        if (u.getDegree()      != null && !u.getDegree().isBlank())      score += 10;
        if (u.getPhone()       != null && !u.getPhone().isBlank())       score += 10;
        if (u.getResumePath()  != null && !u.getResumePath().isBlank())  score += 15;
        if (u.getProfilePhoto()!= null && !u.getProfilePhoto().isBlank())score += 10;
        return Math.min(score, 100);
    }
}
