package com.internship.portal.service;

import com.internship.portal.model.User;
import com.internship.portal.repository.ApplicationRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DocumentService {

    @Autowired private UserRepository        userRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Value("${upload.dir}") private String uploadDir;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    // ── Completion Certificate (HTML → downloadable) ────────────────────────
    public Map<String, Object> generateCertificate(String email, String company,
                                                   String role, String duration,
                                                   String completionDate) {
        Map<String, Object> res = new HashMap<>();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) { res.put("success", false); return res; }

        String name = user.getName() != null ? user.getName() : "Student";
        String date = completionDate != null ? completionDate : LocalDate.now().format(FMT);
        String certId = "CERT-" + System.currentTimeMillis();

        String html = buildCertificateHtml(name, company, role, duration, date, certId);

        try {
            String dir = uploadDir + "certificates/generated/";
            new File(dir).mkdirs();
            String filename = email.replace("@","_") + "_cert_" + System.currentTimeMillis() + ".html";
            Files.writeString(Paths.get(dir, filename), html);
            res.put("success",  true);
            res.put("html",     html);
            res.put("filename", filename);
            res.put("certId",   certId);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
        }
        return res;
    }

    // ── Offer Letter ────────────────────────────────────────────────────────
    public Map<String, Object> generateOfferLetter(String email, String company,
                                                   String role, String startDate,
                                                   String stipend, String duration) {
        Map<String, Object> res = new HashMap<>();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) { res.put("success", false); return res; }

        String name = user.getName() != null ? user.getName() : "Candidate";
        String today = LocalDate.now().format(FMT);

        String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
                "<style>body{font-family:'Georgia',serif;max-width:800px;margin:40px auto;padding:40px;color:#1a1a2e;}" +
                ".header{text-align:center;border-bottom:3px solid #6c63ff;padding-bottom:20px;margin-bottom:30px;}" +
                ".company{font-size:28px;font-weight:bold;color:#6c63ff;}" +
                ".title{font-size:22px;font-weight:bold;text-align:center;margin:30px 0;color:#333;}" +
                ".body{line-height:1.8;font-size:15px;}" +
                ".highlight{background:#f0eeff;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #6c63ff;}" +
                ".field{display:flex;gap:10px;margin:8px 0;}" +
                ".label{font-weight:bold;min-width:140px;color:#6c63ff;}" +
                ".footer{margin-top:60px;display:flex;justify-content:space-between;}" +
                ".sign-block{text-align:center;}" +
                ".sign-line{border-top:1px solid #333;width:200px;margin:0 auto;padding-top:8px;font-size:13px;color:#666;}" +
                ".watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;opacity:0.04;color:#6c63ff;white-space:nowrap;pointer-events:none;}" +
                "</style></head><body>" +
                "<div class='watermark'>INTERNHUB</div>" +
                "<div class='header'><div class='company'>⚡ " + company + "</div>" +
                "<div style='color:#666;margin-top:5px;'>Powered by InternHub Portal</div></div>" +
                "<div class='title'>INTERNSHIP OFFER LETTER</div>" +
                "<div class='body'><p>Date: <strong>" + today + "</strong></p>" +
                "<p>Dear <strong>" + name + "</strong>,</p>" +
                "<p>We are pleased to extend this offer of internship at <strong>" + company +
                "</strong>. After reviewing your profile and skills, we believe you will make a valuable contribution to our team.</p>" +
                "<div class='highlight'>" +
                "<div class='field'><span class='label'>Position:</span><span>" + role + "</span></div>" +
                "<div class='field'><span class='label'>Start Date:</span><span>" + startDate + "</span></div>" +
                "<div class='field'><span class='label'>Duration:</span><span>" + duration + "</span></div>" +
                "<div class='field'><span class='label'>Stipend:</span><span>₹" + stipend + " per month</span></div>" +
                "<div class='field'><span class='label'>Mode:</span><span>As per company policy</span></div>" +
                "</div>" +
                "<p>This internship will provide you with an excellent opportunity to develop your professional skills and gain industry experience.</p>" +
                "<p>Please confirm your acceptance of this offer by replying to this email within 3 working days.</p>" +
                "<p>We look forward to welcoming you to our team!</p>" +
                "<p>Warm regards,</p></div>" +
                "<div class='footer'>" +
                "<div class='sign-block'><div class='sign-line'>HR Manager<br>" + company + "</div></div>" +
                "<div class='sign-block'><div class='sign-line'>Authorized Signatory<br>" + company + "</div></div>" +
                "</div></body></html>";

        res.put("success", true);
        res.put("html",    html);
        return res;
    }

    // ── NOC Generator ────────────────────────────────────────────────────────
    public Map<String, Object> generateNOC(String email, String company,
                                           String role, String startDate, String endDate) {
        Map<String, Object> res = new HashMap<>();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) { res.put("success", false); return res; }

        String name    = user.getName()    != null ? user.getName()    : "Student";
        String college = user.getCollege() != null ? user.getCollege() : "College/University";
        String degree  = user.getDegree()  != null ? user.getDegree()  : "Degree Program";
        String today   = LocalDate.now().format(FMT);
        String nocNum  = "NOC/" + LocalDate.now().getYear() + "/" + (1000 + new Random().nextInt(9000));

        String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
                "<style>body{font-family:'Times New Roman',serif;max-width:800px;margin:40px auto;padding:60px;color:#1a1a2e;}" +
                ".header{text-align:center;margin-bottom:40px;}" +
                ".college{font-size:24px;font-weight:bold;color:#1a1a2e;}" +
                ".subtitle{font-size:14px;color:#555;margin-top:5px;}" +
                ".title{text-align:center;font-size:20px;font-weight:bold;text-decoration:underline;margin:30px 0;}" +
                ".body{line-height:2;font-size:14px;text-align:justify;}" +
                ".ref{font-size:12px;color:#555;margin-bottom:20px;}" +
                ".footer{margin-top:60px;display:flex;justify-content:space-between;font-size:13px;}" +
                ".seal{width:80px;height:80px;border:2px solid #333;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;text-align:center;color:#333;}" +
                "</style></head><body>" +
                "<div class='header'>" +
                "<div class='college'>🎓 " + college + "</div>" +
                "<div class='subtitle'>" + degree + " Program</div>" +
                "<hr style='border:2px solid #1a1a2e;margin:15px 0;'/>" +
                "</div>" +
                "<div class='title'>NO OBJECTION CERTIFICATE</div>" +
                "<div class='ref'>Ref. No: " + nocNum + " &nbsp;&nbsp;&nbsp; Date: " + today + "</div>" +
                "<div class='body'>" +
                "<p>To Whomsoever It May Concern,</p>" +
                "<p>This is to certify that <strong>" + name + "</strong>, a student of <strong>" + degree +
                "</strong> at <strong>" + college + "</strong>, has been granted permission to undergo an internship at " +
                "<strong>" + company + "</strong> as a <strong>" + role + "</strong>.</p>" +
                "<p>The internship period is from <strong>" + startDate + "</strong> to <strong>" + endDate + "</strong>.</p>" +
                "<p>The institution has <strong>No Objection</strong> to the student undertaking this internship during the above-mentioned period, provided it does not interfere with their academic responsibilities.</p>" +
                "<p>We wish the student the very best in their professional endeavour.</p>" +
                "<p style='margin-top:20px;'>For <strong>" + college + "</strong></p>" +
                "</div>" +
                "<div class='footer'>" +
                "<div><p><strong>Head of Department</strong></p><p>" + college + "</p></div>" +
                "<div class='seal'>OFFICIAL<br>SEAL</div>" +
                "</div></body></html>";

        res.put("success", true);
        res.put("html",    html);
        res.put("nocNumber", nocNum);
        return res;
    }

    // ── Certificate HTML ─────────────────────────────────────────────────────
    private String buildCertificateHtml(String name, String company, String role,
                                        String duration, String date, String certId) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'>" +
                "<style>" +
                "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;600&display=swap');" +
                "body{margin:0;background:#f8f4ff;display:flex;align-items:center;justify-content:center;min-height:100vh;}" +
                ".cert{width:900px;background:white;padding:60px;border:2px solid #6c63ff;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.15);}" +
                ".border{position:absolute;inset:10px;border:1px solid rgba(108,99,255,0.3);pointer-events:none;}" +
                ".corner{position:absolute;width:40px;height:40px;border-color:#6c63ff;border-style:solid;}" +
                ".tl{top:16px;left:16px;border-width:3px 0 0 3px;} .tr{top:16px;right:16px;border-width:3px 3px 0 0;}" +
                ".bl{bottom:16px;left:16px;border-width:0 0 3px 3px;} .br{bottom:16px;right:16px;border-width:0 3px 3px 0;}" +
                ".logo{text-align:center;font-size:24px;color:#6c63ff;font-family:Montserrat;font-weight:600;margin-bottom:10px;}" +
                ".title{text-align:center;font-size:42px;font-family:'Cormorant Garamond';font-weight:700;color:#1a1a2e;margin:20px 0 5px;}" +
                ".subtitle{text-align:center;font-size:16px;color:#888;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;font-family:Montserrat;}" +
                ".present{text-align:center;font-size:14px;color:#666;font-family:Montserrat;margin-bottom:10px;letter-spacing:1px;}" +
                ".name{text-align:center;font-size:52px;font-family:'Cormorant Garamond';color:#6c63ff;margin:10px 0;font-style:italic;}" +
                ".desc{text-align:center;font-size:15px;color:#444;line-height:1.8;margin:20px 40px;font-family:Montserrat;}" +
                ".highlight{color:#6c63ff;font-weight:600;}" +
                ".divider{width:200px;height:2px;background:linear-gradient(90deg,transparent,#6c63ff,transparent);margin:30px auto;}" +
                ".footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px;}" +
                ".sign{text-align:center;}" +
                ".sign-line{width:150px;height:1px;background:#333;margin:0 auto 6px;}" +
                ".sign-label{font-size:12px;color:#666;font-family:Montserrat;}" +
                ".cert-id{font-size:11px;color:#aaa;font-family:Montserrat;}" +
                ".badge{background:linear-gradient(135deg,#6c63ff,#a78bfa);color:white;padding:8px 20px;border-radius:20px;font-family:Montserrat;font-size:13px;display:inline-block;margin-top:20px;}" +
                "</style></head><body><div class='cert'>" +
                "<div class='border'></div>" +
                "<div class='corner tl'></div><div class='corner tr'></div>" +
                "<div class='corner bl'></div><div class='corner br'></div>" +
                "<div class='logo'>⚡ InternHub</div>" +
                "<div class='title'>Certificate of Completion</div>" +
                "<div class='subtitle'>Internship Achievement</div>" +
                "<div class='present'>This is to certify that</div>" +
                "<div class='name'>" + name + "</div>" +
                "<div class='desc'>has successfully completed the internship as<br>" +
                "<span class='highlight'>" + role + "</span> at <span class='highlight'>" + company + "</span><br>" +
                "with a duration of <span class='highlight'>" + duration + "</span></div>" +
                "<div class='divider'></div>" +
                "<div style='text-align:center'><div class='badge'>🏅 Successfully Completed</div></div>" +
                "<div class='footer'>" +
                "<div class='cert-id'>Certificate ID: " + certId + "</div>" +
                "<div class='sign'><div class='sign-line'></div><div class='sign-label'>Date: " + date + "</div></div>" +
                "<div class='sign'><div class='sign-line'></div><div class='sign-label'>Authorized by InternHub</div></div>" +
                "</div></div></body></html>";
    }
}
