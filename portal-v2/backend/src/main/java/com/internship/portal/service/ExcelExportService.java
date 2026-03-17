package com.internship.portal.service;

import com.internship.portal.model.Application;
import com.internship.portal.repository.ApplicationRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExcelExportService {

    @Autowired private ApplicationRepository applicationRepository;

    public byte[] exportApplications(String statusFilter) throws Exception {
        List<Application> applications = statusFilter == null || statusFilter.isBlank()
                ? applicationRepository.findAll()
                : applicationRepository.findAll().stream()
                .filter(a -> a.getStatus().name().equalsIgnoreCase(statusFilter))
                .toList();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Applications");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // Date style
            CellStyle dateStyle = workbook.createCellStyle();
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd-mm-yyyy hh:mm"));

            // Headers
            String[] headers = {
                    "#", "Student Name", "Student Email", "Company", "Role",
                    "Status", "Cover Letter", "Applied At", "Updated At",
                    "Interview Date", "Interview Type", "Interview Link", "Admin Note"
            };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            for (Application app : applications) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(app.getId());
                row.createCell(1).setCellValue(safe(app.getStudentName()));
                row.createCell(2).setCellValue(safe(app.getStudentEmail()));
                row.createCell(3).setCellValue(safe(app.getCompanyName()));
                row.createCell(4).setCellValue(safe(app.getRole()));
                row.createCell(5).setCellValue(app.getStatus() != null ? app.getStatus().name() : "");
                row.createCell(6).setCellValue(app.getCoverLetter() != null ? app.getCoverLetter() : "");
                row.createCell(7).setCellValue(app.getAppliedAt() != null ? app.getAppliedAt().toString() : "");
                row.createCell(8).setCellValue(app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : "");
                row.createCell(9).setCellValue(app.getInterviewScheduledAt() != null ? app.getInterviewScheduledAt().toString() : "");
                row.createCell(10).setCellValue(safe(app.getInterviewType()));
                row.createCell(11).setCellValue(safe(app.getInterviewLink()));
                row.createCell(12).setCellValue(safe(app.getAdminNote()));
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Summary sheet
            Sheet summary = workbook.createSheet("Summary");
            summary.createRow(0).createCell(0).setCellValue("Total Applications");
            summary.getRow(0).createCell(1).setCellValue(applications.size());
            summary.createRow(1).createCell(0).setCellValue("Export Date");
            summary.getRow(1).createCell(1).setCellValue(java.time.LocalDateTime.now().toString());

            long accepted = applications.stream().filter(a -> a.getStatus() == Application.Status.ACCEPTED).count();
            long rejected = applications.stream().filter(a -> a.getStatus() == Application.Status.REJECTED).count();
            long pending  = applications.stream().filter(a -> a.getStatus() == Application.Status.APPLIED).count();
            summary.createRow(2).createCell(0).setCellValue("Accepted");
            summary.getRow(2).createCell(1).setCellValue(accepted);
            summary.createRow(3).createCell(0).setCellValue("Rejected");
            summary.getRow(3).createCell(1).setCellValue(rejected);
            summary.createRow(4).createCell(0).setCellValue("Pending");
            summary.getRow(4).createCell(1).setCellValue(pending);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private String safe(String s) { return s != null ? s : ""; }
}
