package com.internship.portal.repository;

import com.internship.portal.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByActiveTrueOrderByPinnedDescPostedAtDesc();
    List<Announcement> findAllByOrderByPinnedDescPostedAtDesc();
}
