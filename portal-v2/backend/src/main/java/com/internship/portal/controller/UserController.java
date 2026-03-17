package com.internship.portal.controller;

import com.internship.portal.repository.UserRepository;
import com.internship.portal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;

    @GetMapping("/{email}")
    public ResponseEntity<?> getUser(@PathVariable String email) {
        return userService.getByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.updateProfile(body));
    }

    @PostMapping("/upload-resume")
    public ResponseEntity<?> uploadResume(@RequestParam String email,
                                          @RequestParam MultipartFile file) {
        return ResponseEntity.ok(userService.uploadResume(email, file));
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam String email,
                                         @RequestParam MultipartFile file) {
        return ResponseEntity.ok(userService.uploadPhoto(email, file));
    }

    @PutMapping("/ban/{id}")
    public ResponseEntity<?> ban(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(userService.banUser(id, body.get("banned")));
    }
}
