package com.internship.portal.controller;

import com.internship.portal.model.CompanyProfile;
import com.internship.portal.model.EmailTemplate;
import com.internship.portal.service.BulkImportService;
import com.internship.portal.service.CompanyProfileService;
import com.internship.portal.service.EmailTemplateService;
import com.internship.portal.service.ExcelExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminFeaturesController {

    @Autowired private CompanyProfileService  companyProfileService;
    @Autowired private BulkImportService      bulkImportService;
    @Autowired private ExcelExportService     excelExportService;
    @Autowired private EmailTemplateService   emailTemplateService;

    // Company Profile
    @PostMapping("/company/save")
    public ResponseEntity<?> saveCompany(@RequestBody CompanyProfile profile, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : "admin@portal.com";
        return ResponseEntity.ok(companyProfileService.saveProfile(profile, email));
    }

    @PostMapping("/company/logo")
    public ResponseEntity<?> uploadLogo(@RequestParam String companyName,
                                        @RequestParam MultipartFile file) {
        return ResponseEntity.ok(companyProfileService.uploadLogo(companyName, file));
    }

    @GetMapping("/company/all")
    public ResponseEntity<?> getAllCompanies() {
        return ResponseEntity.ok(companyProfileService.getAll());
    }

    @GetMapping("/company/{name}")
    public ResponseEntity<?> getCompany(@PathVariable String name) {
        return companyProfileService.getByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Bulk Import
    @PostMapping("/import/excel")
    public ResponseEntity<?> importExcel(@RequestParam MultipartFile file, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : "admin@portal.com";
        return ResponseEntity.ok(bulkImportService.importFromExcel(file, email));
    }

    @PostMapping("/import/csv")
    public ResponseEntity<?> importCsv(@RequestParam MultipartFile file, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : "admin@portal.com";
        return ResponseEntity.ok(bulkImportService.importFromCsv(file, email));
    }

    // Export
    @GetMapping("/export/applications")
    public void exportApplications(@RequestParam(required = false) String status,
                                   HttpServletResponse response) throws Exception {
        byte[] data = excelExportService.exportApplications(status);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=applications.xlsx");
        response.setContentLength(data.length);
        response.getOutputStream().write(data);
        response.getOutputStream().flush();
    }

    // Email Templates
    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates() {
        return ResponseEntity.ok(Map.of(
                "templates", emailTemplateService.getAllTemplates(),
                "defaults",  emailTemplateService.getDefaultTemplates()
        ));
    }

    @PostMapping("/templates/save")
    public ResponseEntity<?> saveTemplate(@RequestBody EmailTemplate template, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : "admin@portal.com";
        return ResponseEntity.ok(emailTemplateService.saveTemplate(template, email));
    }
}
