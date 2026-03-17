package com.internship.portal.service;

import com.internship.portal.model.Notification;
import com.internship.portal.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;

    public List<Notification> getByEmail(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndReadFalse(email);
    }

    public Map<String, Object> markAllRead(String email) {
        List<Notification> list = notificationRepository.findByUserEmail(email);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return res;
    }
}
