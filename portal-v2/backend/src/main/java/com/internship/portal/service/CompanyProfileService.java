package com.internship.portal.service;

import com.internship.portal.model.CompanyProfile;
import com.internship.portal.repository.CompanyProfileRepository;
import com.internship.portal.repository.InternshipRepository;
import com.internship.portal.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CompanyProfileService {

    @Autowired private CompanyProfileRepository companyProfileRepository;
    @Autowired private InternshipRepository internshipRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Value("${upload.dir}") private String uploadDir;

    public Map<String, Object> saveProfile(CompanyProfile profile, String adminEmail) {
        Map<String, Object> res = new HashMap<>();
        Optional<CompanyProfile> existing = companyProfileRepository.findByCompanyName(profile.getCompanyName());
        CompanyProfile cp = existing.orElse(new CompanyProfile());

        cp.setCompanyName(profile.getCompanyName());
        cp.setWebsite(profile.getWebsite());
        cp.setIndustry(profile.getIndustry());
        cp.setLocation(profile.getLocation());
        cp.setFoundedYear(profile.getFoundedYear());
        cp.setCompanySize(profile.getCompanySize());
        cp.setAbout(profile.getAbout());
        cp.setBenefits(profile.getBenefits());
        cp.setLinkedinUrl(profile.getLinkedinUrl());
        cp.setTwitterUrl(profile.getTwitterUrl());
        cp.setGlassdoorUrl(profile.getGlassdoorUrl());
        cp.setCreatedByEmail(adminEmail);
        cp.setUpdatedAt(LocalDateTime.now());

        long internshipCount = internshipRepository.findAll().stream()
                .filter(i -> i.getCompanyName() != null &&
                        i.getCompanyName().equalsIgnoreCase(profile.getCompanyName()))
                .count();
        cp.setTotalInternships((int) internshipCount);

        Double avgRating = reviewRepository.avgRatingByCompany(profile.getCompanyName());
        cp.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        cp.setTotalReviews(reviewRepository.findByCompanyName(profile.getCompanyName()).size());

        companyProfileRepository.save(cp);
        res.put("success", true);
        res.put("message", "Company profile saved!");
        res.put("profile", cp);
        return res;
    }

    public Map<String, Object> uploadLogo(String companyName, MultipartFile file) {
        Map<String, Object> res = new HashMap<>();
        try {
            String dir = uploadDir + "logos/";
            new File(dir).mkdirs();
            String ext = file.getOriginalFilename() != null &&
                    file.getOriginalFilename().contains(".")
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.'))
                    : ".png";
            String filename = companyName.replaceAll("\\s+", "_").toLowerCase()
                    + "_logo_" + System.currentTimeMillis() + ext;
            Files.write(Paths.get(dir, filename), file.getBytes());

            companyProfileRepository.findByCompanyName(companyName).ifPresent(cp -> {
                cp.setLogoPath(filename);
                companyProfileRepository.save(cp);
            });
            res.put("success", true);
            res.put("filename", filename);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    public Optional<CompanyProfile> getByName(String companyName) {
        return companyProfileRepository.findByCompanyName(companyName);
    }

    public List<CompanyProfile> getAll() {
        return companyProfileRepository.findAll();
    }
}
