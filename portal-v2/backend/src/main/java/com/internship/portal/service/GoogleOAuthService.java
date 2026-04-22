package com.internship.portal.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.internship.portal.model.User;
import com.internship.portal.repository.UserRepository;
import com.internship.portal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

//@Service
public class GoogleOAuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    public Map<String, Object> loginWithGoogle(String idTokenString) {
        Map<String, Object> res = new HashMap<>();
        try {
            // Verify the Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                res.put("success", false);
                res.put("message", "Invalid Google token");
                return res;
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name  = (String) payload.get("name");
            String photo = (String) payload.get("picture");

            // Find or auto-create user
            Optional<User> existing = userRepository.findByEmail(email);
            User user;

            if (existing.isPresent()) {
                user = existing.get();
                if (user.isBanned()) {
                    res.put("success", false);
                    res.put("message", "Account suspended");
                    return res;
                }
                // Update photo if changed
                if (photo != null && user.getProfilePhoto() == null) {
                    user.setProfilePhoto(photo);
                    userRepository.save(user);
                }
            } else {
                // Auto-register new Google user
                user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setPassword("GOOGLE_OAUTH_" + System.currentTimeMillis());
                user.setRole(User.Role.STUDENT);
                user.setVerified(true); // Google already verified the email
                user.setProfilePhoto(photo);
                userRepository.save(user);
            }

            // Generate JWT
            String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            res.put("success", true);
            res.put("token", jwt);
            res.put("id", user.getId());
            res.put("name", user.getName());
            res.put("email", user.getEmail());
            res.put("role", user.getRole());
            res.put("profilePhoto", user.getProfilePhoto());
            res.put("profileCompletion", user.getProfileCompletion());

        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Google login failed: " + e.getMessage());
        }
        return res;
    }
}
