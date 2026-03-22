package com.internship.portal.controller;
import com.internship.portal.service.DiscussionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/discussions") @CrossOrigin(origins="http://localhost:3000")
public class DiscussionController {
    @Autowired private DiscussionService discussionService;
    @GetMapping public ResponseEntity<?> getPosts(@RequestParam(required=false) String category) { return ResponseEntity.ok(discussionService.getPosts(category)); }
    @PostMapping public ResponseEntity<?> create(@RequestBody Map<String,String> b) { return ResponseEntity.ok(discussionService.createPost(b)); }
    @GetMapping("/{id}") public ResponseEntity<?> getPost(@PathVariable Long id) { return ResponseEntity.ok(discussionService.getPostWithReplies(id)); }
    @PostMapping("/{id}/reply") public ResponseEntity<?> reply(@PathVariable Long id, @RequestBody Map<String,String> b) { return ResponseEntity.ok(discussionService.addReply(id,b)); }
    @PostMapping("/{id}/like") public ResponseEntity<?> like(@PathVariable Long id) { return ResponseEntity.ok(discussionService.likePost(id)); }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id, Authentication a) { return ResponseEntity.ok(discussionService.deletePost(id,(String)a.getPrincipal())); }
}
