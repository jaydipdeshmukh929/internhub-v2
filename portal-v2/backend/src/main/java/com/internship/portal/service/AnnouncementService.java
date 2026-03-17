package com.internship.portal.service;

import com.internship.portal.model.Announcement;
import com.internship.portal.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnnouncementService {

    @Autowired private AnnouncementRepository announcementRepository;

    public Map<String, Object> post(Announcement announcement, String adminEmail, String adminName) {
        Map<String, Object> res = new HashMap<>();
        announcement.setPostedByEmail(adminEmail);
        announcement.setPostedByName(adminName);
        announcementRepository.save(announcement);
        res.put("success", true);
        res.put("message", "Announcement posted!");
        return res;
    }

    public List<Announcement> getActive() {
        return announcementRepository.findByActiveTrueOrderByPinnedDescPostedAtDesc();
    }

    public List<Announcement> getAll() {
        return announcementRepository.findAllByOrderByPinnedDescPostedAtDesc();
    }

    public Map<String, Object> delete(Long id) {
        Map<String, Object> res = new HashMap<>();
        announcementRepository.findById(id).ifPresent(a -> {
            a.setActive(false);
            announcementRepository.save(a);
        });
        res.put("success", true);
        return res;
    }

    public Map<String, Object> togglePin(Long id) {
        Map<String, Object> res = new HashMap<>();
        announcementRepository.findById(id).ifPresent(a -> {
            a.setPinned(!a.isPinned());
            announcementRepository.save(a);
            res.put("pinned", a.isPinned());
        });
        res.put("success", true);
        return res;
    }
}
