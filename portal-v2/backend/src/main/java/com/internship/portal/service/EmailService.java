package com.internship.portal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired private JavaMailSender mailSender;
    @Value("${app.name}") private String appName;

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("[" + appName + "] " + subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            System.out.println("Mail error: " + e.getMessage());
        }
    }

    public void sendRaw(String to, String subject, String body) {
        send(to, subject, body);
    }

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
                        " has been received.\n\nWe will notify you of any updates.\n\n— " + appName);
    }

    public void sendStatusUpdate(String to, String name, String role,
                                 String company, String status, String note) {
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
                        "! Your account is verified.\n\nStart exploring internships!\n\n— " + appName);
    }

    public void sendDeadlineReminder(String to, String name, String role,
                                     String company, String deadline) {
        send(to, "Deadline Reminder – " + role + " at " + company,
                "Hi " + name + ",\n\nThe application deadline for \"" + role + "\" at " + company +
                        " is approaching: " + deadline +
                        "\n\nLog in and apply before it is too late!\n\nhttp://localhost:3000/dashboard\n\n— " + appName);
    }

    public void sendReferralWelcome(String to, String name, String referrerName) {
        send(to, "You were referred to " + appName + "!",
                "Hi " + name + ",\n\nYou joined InternHub through " + referrerName +
                        "'s referral link!\n\nStart exploring internships.\n\n— " + appName);
    }
}
