package com.internship.portal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    // ─── Core send method using Resend REST API ───────────────────────────────
    private void send(String to, String subject, String body) {
        try {
            String safeBody = body
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

            String json = "{"
                + "\"from\":\"" + appName + " <" + fromEmail + ">\","
                + "\"to\":[\"" + to + "\"],"
                + "\"subject\":\"[" + appName + "] " + subject + "\","
                + "\"text\":\"" + safeBody + "\""
                + "}";

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                System.out.println("Mail sent successfully to: " + to);
            } else {
                System.out.println("Mail error [" + response.statusCode() + "]: " + response.body());
            }
        } catch (Exception e) {
            System.out.println("Mail error: " + e.getMessage());
        }
    }

    // ─── Public email methods ─────────────────────────────────────────────────

    public void sendOtp(String to, String name, String otp) {
        send(to, "Email Verification OTP",
            "Hi " + name + ",\n\nYour OTP for email verification is: " + otp +
            "\n\nThis OTP expires in 10 minutes.\n\nDo not share this with anyone.\n\n— " + appName);
    }

    public void sendPasswordResetOtp(String to, String name, String otp) {
        send(to, "Password Reset OTP",
            "Hi " + name + ",\n\nYour password reset OTP is: " + otp +
            "\n\nExpires in 10 minutes.\n\n— " + appName);
    }

    public void sendApplicationConfirmation(String to, String name, String role, String company) {
        send(to, "Application Submitted – " + role + " at " + company,
            "Hi " + name + ",\n\nYour application for \"" + role + "\" at " + company +
            " has been received.\n\nWe'll notify you of any updates.\n\n— " + appName);
    }

    public void sendStatusUpdate(String to, String name, String role, String company, String status, String note) {
        String msg = "Hi " + name + ",\n\nYour application for \"" + role + "\" at " + company +
            " has been updated.\n\nStatus: " + status;
        if (note != null && !note.isEmpty()) msg += "\n\nNote from recruiter: " + note;
        if (status.equals("ACCEPTED"))            msg += "\n\nCongratulations! The team will reach out shortly.";
        if (status.equals("INTERVIEW_SCHEDULED")) msg += "\n\nPrepare well — we believe in you!";
        send(to, "Application Update – " + company, msg + "\n\n— " + appName);
    }

    public void sendInterviewDetails(String to, String name, String role, String company,
                                      String dateTime, String link, String type) {
        send(to, "Interview Scheduled – " + company,
            "Hi " + name + ",\n\nYour interview for \"" + role + "\" at " + company +
            " is scheduled.\n\nDate/Time: " + dateTime + "\nMode: " + type +
            (link != null ? "\nLink: " + link : "") +
            "\n\nAll the best!\n\n— " + appName);
    }

    public void sendWelcome(String to, String name) {
        send(to, "Welcome to " + appName + "!",
            "Hi " + name + ",\n\nWelcome to " + appName +
            "! Your account is verified.\n\nStart exploring internships and build your career!\n\n— " + appName);
    }

    // ─── Used by EmailTemplateService ─────────────────────────────────────────
    public void sendRaw(String to, String subject, String body) {
        send(to, subject, body);
    }
}
