package com.internship.portal.controller;
import com.internship.portal.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/documents") @CrossOrigin(origins="*")
public class DocumentController {
    @Autowired private DocumentService documentService;
    @PostMapping("/certificate") public ResponseEntity<?> certificate(@RequestBody Map<String,String> b, Authentication a) {
        String email = a!=null?(String)a.getPrincipal():b.get("email");
        return ResponseEntity.ok(documentService.generateCertificate(email,b.get("company"),b.get("role"),b.get("duration"),b.get("completionDate")));
    }
    @PostMapping("/offer-letter") public ResponseEntity<?> offerLetter(@RequestBody Map<String,String> b, Authentication a) {
        String email = a!=null?(String)a.getPrincipal():b.get("email");
        return ResponseEntity.ok(documentService.generateOfferLetter(email,b.get("company"),b.get("role"),b.get("startDate"),b.get("stipend"),b.get("duration")));
    }
    @PostMapping("/noc") public ResponseEntity<?> noc(@RequestBody Map<String,String> b, Authentication a) {
        String email = a!=null?(String)a.getPrincipal():b.get("email");
        return ResponseEntity.ok(documentService.generateNOC(email,b.get("company"),b.get("role"),b.get("startDate"),b.get("endDate")));
    }
}
