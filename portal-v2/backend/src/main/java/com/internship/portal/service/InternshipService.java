package com.internship.portal.service;

import com.internship.portal.model.Internship;
import com.internship.portal.model.User;
import com.internship.portal.repository.InternshipRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InternshipService {

    @Autowired private InternshipRepository internshipRepository;
    @Autowired private UserRepository userRepository;

    public List<Internship> getAll() {
        return internshipRepository.findByStatus(Internship.Status.ACTIVE);
    }

    // Advanced search with all filters + sorting
    public List<Internship> advancedSearch(String keyword, String location, String category,
                                           Double minStipend, Double maxStipend,
                                           Boolean remote, String type, String sortBy) {
        String kw  = isBlank(keyword)   ? null : keyword;
        String loc = isBlank(location)  ? null : location;
        String cat = isBlank(category)  ? null : category;
        String tp  = isBlank(type)      ? null : type;

        List<Internship> results = internshipRepository.advancedSearch(
                kw, loc, cat, minStipend, maxStipend, remote, tp);

        // Sort
        if (sortBy != null) {
            switch (sortBy) {
                case "stipend"     -> results.sort((a, b) -> Double.compare(
                        b.getStipend() == null ? 0 : b.getStipend(),
                        a.getStipend() == null ? 0 : a.getStipend()));
                case "applied"     -> results.sort((a, b) -> Integer.compare(
                        b.getApplicationCount() == null ? 0 : b.getApplicationCount(),
                        a.getApplicationCount() == null ? 0 : a.getApplicationCount()));
                case "deadline"    -> results.sort((a, b) -> {
                    if (a.getApplyDeadline() == null) return 1;
                    if (b.getApplyDeadline() == null) return -1;
                    return a.getApplyDeadline().compareTo(b.getApplyDeadline());
                });
                case "views"       -> results.sort((a, b) -> Integer.compare(
                        b.getViewCount() == null ? 0 : b.getViewCount(),
                        a.getViewCount() == null ? 0 : a.getViewCount()));
                default            -> results.sort((a, b) -> b.getPostedAt().compareTo(a.getPostedAt()));
            }
        }
        return results;
    }

    public Optional<Internship> getById(Long id) {
        Optional<Internship> opt = internshipRepository.findById(id);
        opt.ifPresent(i -> {
            i.setViewCount((i.getViewCount() == null ? 0 : i.getViewCount()) + 1);
            internshipRepository.save(i);
        });
        return opt;
    }

    public List<Internship> getSimilar(Long id) {
        return internshipRepository.findById(id)
                .map(i -> internshipRepository.findSimilar(i.getCategory(), id)
                        .stream().limit(4).collect(Collectors.toList()))
                .orElse(new ArrayList<>());
    }

    public List<Internship> getTrending() {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        List<Internship> trending = internshipRepository.findTrending(oneWeekAgo);
        if (trending.isEmpty()) {
            trending = internshipRepository.findTop5ByStatusOrderByViewCountDesc(Internship.Status.ACTIVE);
        }
        return trending.stream().limit(6).collect(Collectors.toList());
    }

    public List<Internship> getLatest() {
        return internshipRepository.findTop5ByStatusOrderByPostedAtDesc(Internship.Status.ACTIVE);
    }

    public Internship add(Internship internship) {
        return internshipRepository.save(internship);
    }

    public Internship update(Long id, Internship updated) {
        Internship existing = internshipRepository.findById(id).orElseThrow();
        existing.setCompanyName(updated.getCompanyName());
        existing.setRole(updated.getRole());
        existing.setLocation(updated.getLocation());
        existing.setRemote(updated.isRemote());
        existing.setDuration(updated.getDuration());
        existing.setStipend(updated.getStipend());
        existing.setDescription(updated.getDescription());
        existing.setResponsibilities(updated.getResponsibilities());
        existing.setRequirements(updated.getRequirements());
        existing.setSkillsRequired(updated.getSkillsRequired());
        existing.setCategory(updated.getCategory());
        existing.setType(updated.getType());
        existing.setApplyDeadline(updated.getApplyDeadline());
        existing.setOpenings(updated.getOpenings());
        existing.setStatus(updated.getStatus());
        return internshipRepository.save(existing);
    }

    public void delete(Long id) { internshipRepository.deleteById(id); }

    // Bookmark toggle
    public Map<String, Object> toggleBookmark(String email, Long internshipId) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); return res; }
        User user = opt.get();
        String saved = user.getSavedInternshipIds() == null ? "" : user.getSavedInternshipIds();
        List<String> ids = new ArrayList<>(Arrays.asList(saved.split(",")));
        ids.removeIf(String::isBlank);
        String sid = String.valueOf(internshipId);
        boolean bookmarked;
        if (ids.contains(sid)) { ids.remove(sid); bookmarked = false; }
        else { ids.add(sid); bookmarked = true; }
        user.setSavedInternshipIds(String.join(",", ids));
        userRepository.save(user);
        res.put("success", true);
        res.put("bookmarked", bookmarked);
        return res;
    }

    public List<Internship> getSavedInternships(String email) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) return new ArrayList<>();
        String saved = opt.get().getSavedInternshipIds();
        if (saved == null || saved.isBlank()) return new ArrayList<>();
        List<Internship> list = new ArrayList<>();
        for (String id : saved.split(",")) {
            if (!id.isBlank()) internshipRepository.findById(Long.parseLong(id)).ifPresent(list::add);
        }
        return list;
    }

    // Company-wise analytics
    public List<Map<String, Object>> getCompanyAnalytics() {
        List<Object[]> raw = internshipRepository.companyWiseApplicationCount();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> m = new HashMap<>();
            m.put("company", row[0]);
            m.put("applications", row[1]);
            result.add(m);
        }
        return result;
    }

    private boolean isBlank(String s) { return s == null || s.isBlank(); }
}
