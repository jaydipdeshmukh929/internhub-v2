package com.internship.portal.repository;
import com.internship.portal.model.DiscussionPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface DiscussionPostRepository extends JpaRepository<DiscussionPost, Long> {
    List<DiscussionPost> findByCategoryOrderByPinnedDescPostedAtDesc(String category);
    List<DiscussionPost> findAllByOrderByPinnedDescPostedAtDesc();
}
