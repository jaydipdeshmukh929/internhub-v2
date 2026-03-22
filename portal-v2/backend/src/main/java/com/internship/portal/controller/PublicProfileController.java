package com.internship.portal.controller;
import com.internship.portal.service.PublicProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @CrossOrigin(origins="http://localhost:3000")
public class PublicProfileController {
    @Autowired private PublicProfileService service;
    @PostMapping("/api/profile/enable-public") public ResponseEntity<?> enable(Authentication a) { return ResponseEntity.ok(service.enablePublicProfile((String)a.getPrincipal())); }
    @PostMapping("/api/profile/disable-public") public ResponseEntity<?> disable(Authentication a) { return ResponseEntity.ok(service.disablePublicProfile((String)a.getPrincipal())); }
    @GetMapping("/api/student/{slug}") public ResponseEntity<?> getPublic(@PathVariable String slug) { return ResponseEntity.ok(service.getBySlug(slug)); }
    @PostMapping("/api/profile/premium") public ResponseEntity<?> premium(@RequestBody Map<String,Object> b, Authentication a) { return ResponseEntity.ok(service.activatePremium((String)a.getPrincipal(), Integer.parseInt(b.get("months").toString()))); }
    @PostMapping("/api/profile/mark-alumni") public ResponseEntity<?> markAlumni(@RequestBody Map<String,String> b, Authentication a) { return ResponseEntity.ok(service.markAlumni((String)a.getPrincipal(), b.get("completedAt"))); }
}
