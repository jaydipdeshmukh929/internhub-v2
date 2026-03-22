package com.internship.portal.repository;
import com.internship.portal.model.DiscussionReply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface DiscussionReplyRepository extends JpaRepository<DiscussionReply, Long> {
    List<DiscussionReply> findByPostIdOrderByPostedAtAsc(Long postId);
    long countByPostId(Long postId);
}
