package com.internship.portal.service;

import com.internship.portal.model.Internship;
import com.internship.portal.model.User;
import com.internship.portal.repository.InternshipRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DiscoveryService {

    @Autowired private UserRepository        userRepository;
    @Autowired private InternshipRepository  internshipRepository;

    // ── Search History ──────────────────────────────────────────────────────
    public Map<String, Object> addSearchHistory(String email, String keyword) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            List<String> history = parseJsonArray(u.getSearchHistory());
            history.remove(keyword); // remove duplicate
            history.add(0, keyword); // add to front
            if (history.size() > 10) history = history.subList(0, 10); // keep last 10
            u.setSearchHistory(toJsonArray(history));
            userRepository.save(u);
        });
        res.put("success", true);
        return res;
    }

    public Map<String, Object> getSearchHistory(String email) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u ->
                res.put("history", parseJsonArray(u.getSearchHistory())));
        res.put("success", true);
        return res;
    }

    public Map<String, Object> clearSearchHistory(String email) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setSearchHistory("[]");
            userRepository.save(u);
        });
        res.put("success", true);
        return res;
    }

    // ── Saved Filter Presets ────────────────────────────────────────────────
    public Map<String, Object> saveFilterPreset(String email, String name, Map<String, Object> filters) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            List<Map<String, Object>> presets = parseJsonPresets(u.getSavedFilters());
            // Remove if same name exists
            presets.removeIf(p -> name.equals(p.get("name")));
            Map<String, Object> preset = new HashMap<>();
            preset.put("name",    name);
            preset.put("filters", filters);
            preset.put("savedAt", java.time.LocalDateTime.now().toString());
            presets.add(0, preset);
            if (presets.size() > 5) presets = presets.subList(0, 5);
            u.setSavedFilters(presetsToJson(presets));
            userRepository.save(u);
        });
        res.put("success", true);
        res.put("message", "Filter preset '" + name + "' saved!");
        return res;
    }

    public Map<String, Object> getSavedFilters(String email) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u ->
                res.put("presets", parseJsonPresets(u.getSavedFilters())));
        res.put("success", true);
        return res;
    }

    public Map<String, Object> deleteFilterPreset(String email, String name) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            List<Map<String, Object>> presets = parseJsonPresets(u.getSavedFilters());
            presets.removeIf(p -> name.equals(p.get("name")));
            u.setSavedFilters(presetsToJson(presets));
            userRepository.save(u);
        });
        res.put("success", true);
        return res;
    }

    // ── Search by Skill Tag ──────────────────────────────────────────────────
    public List<Internship> searchBySkill(String skill) {
        String lower = skill.toLowerCase();
        return internshipRepository.findByStatus(Internship.Status.ACTIVE).stream()
                .filter(i -> i.getSkillsRequired() != null &&
                        i.getSkillsRequired().toLowerCase().contains(lower))
                .sorted((a, b) -> Integer.compare(
                        b.getApplicationCount() == null ? 0 : b.getApplicationCount(),
                        a.getApplicationCount() == null ? 0 : a.getApplicationCount()))
                .collect(Collectors.toList());
    }

    // ── Follow Companies ─────────────────────────────────────────────────────
    public Map<String, Object> toggleFollowCompany(String email, String companyName) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            String followed = u.getFollowedCompanies() == null ? "" : u.getFollowedCompanies();
            List<String> list = new ArrayList<>(Arrays.asList(followed.split(",")));
            list.removeIf(String::isBlank);
            boolean following;
            if (list.contains(companyName)) {
                list.remove(companyName);
                following = false;
            } else {
                list.add(companyName);
                following = true;
            }
            u.setFollowedCompanies(String.join(",", list));
            userRepository.save(u);
            res.put("following", following);
        });
        res.put("success", true);
        return res;
    }

    public Map<String, Object> getFollowedCompanies(String email) {
        Map<String, Object> res = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(u -> {
            String followed = u.getFollowedCompanies();
            if (followed == null || followed.isBlank()) {
                res.put("companies", new ArrayList<>());
            } else {
                List<String> companies = Arrays.stream(followed.split(","))
                        .filter(s -> !s.isBlank()).collect(Collectors.toList());
                res.put("companies", companies);
                // Get latest internships from followed companies
                List<Internship> newInternships = internshipRepository.findByStatus(Internship.Status.ACTIVE).stream()
                        .filter(i -> companies.contains(i.getCompanyName()))
                        .sorted((a, b) -> b.getPostedAt().compareTo(a.getPostedAt()))
                        .limit(10)
                        .collect(Collectors.toList());
                res.put("newInternships", newInternships);
            }
        });
        res.put("success", true);
        return res;
    }

    // ── Alumni Network ───────────────────────────────────────────────────────
    public List<Map<String, Object>> getAlumniNetwork() {
        return userRepository.findAll().stream()
                .filter(u -> u.isAlumni() && u.isProfilePublic())
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name",       u.getName());
                    m.put("college",    u.getCollege());
                    m.put("skills",     u.getSkills());
                    m.put("linkedinUrl",u.getLinkedinUrl());
                    m.put("completedAt",u.getCompletedAt());
                    m.put("slug",       u.getPublicSlug());
                    return m;
                })
                .collect(Collectors.toList());
    }

    // ── Map data — internships with lat/lng ──────────────────────────────────
    public List<Map<String, Object>> getInternshipsForMap() {
        return internshipRepository.findByStatus(Internship.Status.ACTIVE).stream()
                .filter(i -> i.getLatitude() != null && i.getLongitude() != null)
                .map(i -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",          i.getId());
                    m.put("companyName", i.getCompanyName());
                    m.put("role",        i.getRole());
                    m.put("location",    i.getLocation());
                    m.put("lat",         i.getLatitude());
                    m.put("lng",         i.getLongitude());
                    m.put("stipend",     i.getStipend());
                    m.put("remote",      i.isRemote());
                    return m;
                })
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return new ArrayList<>();
        try {
            json = json.replace("[", "").replace("]", "");
            if (json.isBlank()) return new ArrayList<>();
            return new ArrayList<>(Arrays.asList(json.split(",\\s*\"?|\"?")));
        } catch (Exception e) { return new ArrayList<>(); }
    }

    private String toJsonArray(List<String> list) {
        if (list.isEmpty()) return "[]";
        return "[\"" + String.join("\",\"", list) + "\"]";
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseJsonPresets(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) return new ArrayList<>();
        return new ArrayList<>(); // simplified — frontend handles JSON
    }

    private String presetsToJson(List<Map<String, Object>> presets) {
        if (presets.isEmpty()) return "[]";
        // Simplified serialization
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < presets.size(); i++) {
            if (i > 0) sb.append(",");
            Map<String, Object> p = presets.get(i);
            sb.append("{\"name\":\"").append(p.get("name")).append("\",\"savedAt\":\"").append(p.get("savedAt")).append("\"}");
        }
        return sb.append("]").toString();
    }
}
