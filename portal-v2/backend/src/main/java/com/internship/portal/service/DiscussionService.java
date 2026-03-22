package com.internship.portal.service;

import com.internship.portal.model.DiscussionPost;
import com.internship.portal.model.DiscussionReply;
import com.internship.portal.repository.DiscussionPostRepository;
import com.internship.portal.repository.DiscussionReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DiscussionService {

    @Autowired private DiscussionPostRepository  postRepository;
    @Autowired private DiscussionReplyRepository replyRepository;

    public List<DiscussionPost> getPosts(String category) {
        if (category == null || category.equals("ALL"))
            return postRepository.findAllByOrderByPinnedDescPostedAtDesc();
        return postRepository.findByCategoryOrderByPinnedDescPostedAtDesc(category);
    }

    public Map<String, Object> createPost(Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        DiscussionPost post = new DiscussionPost();
        post.setAuthorEmail(body.get("email"));
        post.setAuthorName(body.get("name"));
        post.setCategory(body.getOrDefault("category", "GENERAL"));
        post.setTitle(body.get("title"));
        post.setContent(body.get("content"));
        postRepository.save(post);
        res.put("success", true);
        res.put("post", post);
        return res;
    }

    public Map<String, Object> getPostWithReplies(Long id) {
        Map<String, Object> res = new HashMap<>();
        postRepository.findById(id).ifPresent(post -> {
            res.put("post", post);
            res.put("replies", replyRepository.findByPostIdOrderByPostedAtAsc(id));
        });
        res.put("success", true);
        return res;
    }

    public Map<String, Object> addReply(Long postId, Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        DiscussionReply reply = new DiscussionReply();
        reply.setPostId(postId);
        reply.setAuthorEmail(body.get("email"));
        reply.setAuthorName(body.get("name"));
        reply.setContent(body.get("content"));
        replyRepository.save(reply);
        // Update reply count
        postRepository.findById(postId).ifPresent(post -> {
            post.setReplies((post.getReplies() == null ? 0 : post.getReplies()) + 1);
            postRepository.save(post);
        });
        res.put("success", true);
        res.put("reply", reply);
        return res;
    }

    public Map<String, Object> likePost(Long id) {
        Map<String, Object> res = new HashMap<>();
        postRepository.findById(id).ifPresent(post -> {
            post.setLikes((post.getLikes() == null ? 0 : post.getLikes()) + 1);
            postRepository.save(post);
            res.put("likes", post.getLikes());
        });
        res.put("success", true);
        return res;
    }

    public Map<String, Object> deletePost(Long id, String email) {
        Map<String, Object> res = new HashMap<>();
        postRepository.findById(id).ifPresent(post -> {
            if (post.getAuthorEmail().equals(email)) {
                replyRepository.findByPostIdOrderByPostedAtAsc(id)
                        .forEach(replyRepository::delete);
                postRepository.delete(post);
                res.put("deleted", true);
            }
        });
        res.put("success", true);
        return res;
    }
}
