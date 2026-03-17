package com.internship.portal.service;

import com.internship.portal.model.Certificate;
import com.internship.portal.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;

@Service
public class CertificateService {

    @Autowired private CertificateRepository certificateRepository;
    @Value("${upload.dir}") private String uploadDir;

    public Map<String, Object> upload(String email, String name, String company,
                                      String role, String completionDate, MultipartFile file) {
        Map<String, Object> res = new HashMap<>();
        try {
            String dir = uploadDir + "certificates/";
            new File(dir).mkdirs();

            String filename = email.replace("@","_") + "_" + System.currentTimeMillis()
                    + "_" + file.getOriginalFilename();
            Files.write(Paths.get(dir, filename), file.getBytes());

            Certificate cert = new Certificate();
            cert.setStudentEmail(email);
            cert.setStudentName(name);
            cert.setCompanyName(company);
            cert.setInternshipRole(role);
            cert.setFilePath(dir + filename);
            cert.setFileName(file.getOriginalFilename());
            if (completionDate != null && !completionDate.isBlank())
                cert.setCompletionDate(LocalDate.parse(completionDate));
            certificateRepository.save(cert);

            res.put("success", true);
            res.put("message", "Certificate uploaded successfully!");
            res.put("filename", file.getOriginalFilename());
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Upload failed: " + e.getMessage());
        }
        return res;
    }

    public List<Certificate> getByEmail(String email) {
        return certificateRepository.findByStudentEmail(email);
    }

    public Map<String, Object> delete(Long id) {
        Map<String, Object> res = new HashMap<>();
        certificateRepository.deleteById(id);
        res.put("success", true);
        return res;
    }

    public Object getMyCertificates(String email) {
        return null;
    }
}
