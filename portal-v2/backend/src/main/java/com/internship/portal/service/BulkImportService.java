package com.internship.portal.service;

import com.internship.portal.model.Internship;
import com.internship.portal.repository.InternshipRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.*;

@Service
public class BulkImportService {

    @Autowired private InternshipRepository internshipRepository;

    public Map<String, Object> importFromExcel(MultipartFile file, String adminEmail) {
        Map<String, Object> res = new HashMap<>();
        List<String> errors = new ArrayList<>();
        int imported = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            // Skip header row (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                try {
                    Internship internship = rowToInternship(row, adminEmail);
                    if (internship != null) {
                        internshipRepository.save(internship);
                        imported++;
                    }
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
            res.put("success", true);
            res.put("imported", imported);
            res.put("errors", errors);
            res.put("message", "Imported " + imported + " internships successfully.");

        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Failed to parse Excel: " + e.getMessage());
        }
        return res;
    }

    public Map<String, Object> importFromCsv(MultipartFile file, String adminEmail) {
        Map<String, Object> res = new HashMap<>();
        List<String> errors = new ArrayList<>();
        int imported = 0;
        int lineNum = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isHeader = true;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (isHeader) { isHeader = false; continue; } // skip header
                if (line.trim().isEmpty()) continue;

                try {
                    String[] cols = parseCsvLine(line);
                    Internship internship = colsToInternship(cols, adminEmail);
                    if (internship != null) {
                        internshipRepository.save(internship);
                        imported++;
                    }
                } catch (Exception e) {
                    errors.add("Line " + lineNum + ": " + e.getMessage());
                }
            }
            res.put("success", true);
            res.put("imported", imported);
            res.put("errors", errors);
            res.put("message", "Imported " + imported + " internships.");

        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Failed to parse CSV: " + e.getMessage());
        }
        return res;
    }

    // Expected Excel columns (in order):
    // companyName | role | location | duration | stipend | category | skillsRequired | description | openings | remote | applyDeadline
    private Internship rowToInternship(Row row, String adminEmail) {
        String companyName = getCellString(row, 0);
        String role        = getCellString(row, 1);
        if (companyName.isBlank() || role.isBlank()) return null;

        Internship i = new Internship();
        i.setCompanyName(companyName);
        i.setRole(role);
        i.setLocation(getCellString(row, 2));
        i.setDuration(getCellString(row, 3));
        i.setStipend(getCellDouble(row, 4));
        i.setCategory(getCellString(row, 5).isBlank() ? "Technology" : getCellString(row, 5));
        i.setSkillsRequired(getCellString(row, 6));
        i.setDescription(getCellString(row, 7));
        i.setOpenings((int) getCellDouble(row, 8));
        i.setRemote("true".equalsIgnoreCase(getCellString(row, 9)) || "yes".equalsIgnoreCase(getCellString(row, 9)));
        String deadline = getCellString(row, 10);
        if (!deadline.isBlank()) {
            try { i.setApplyDeadline(LocalDate.parse(deadline)); } catch (Exception ignored) {}
        }
        i.setStatus(Internship.Status.ACTIVE);
        i.setPostedByEmail(adminEmail);
        return i;
    }

    private Internship colsToInternship(String[] cols, String adminEmail) {
        if (cols.length < 2) return null;
        String companyName = cols[0].trim();
        String role        = cols.length > 1 ? cols[1].trim() : "";
        if (companyName.isBlank() || role.isBlank()) return null;

        Internship i = new Internship();
        i.setCompanyName(companyName);
        i.setRole(role);
        i.setLocation(       cols.length > 2  ? cols[2].trim()  : "");
        i.setDuration(       cols.length > 3  ? cols[3].trim()  : "");
        i.setStipend(        cols.length > 4  ? parseDouble(cols[4]) : null);
        i.setCategory(       cols.length > 5  ? cols[5].trim()  : "Technology");
        i.setSkillsRequired( cols.length > 6  ? cols[6].trim()  : "");
        i.setDescription(    cols.length > 7  ? cols[7].trim()  : "");
        i.setOpenings(       cols.length > 8  ? parseInt(cols[8]) : null);
        i.setRemote(         cols.length > 9  && ("true".equalsIgnoreCase(cols[9].trim()) || "yes".equalsIgnoreCase(cols[9].trim())));
        if (cols.length > 10 && !cols[10].trim().isBlank()) {
            try { i.setApplyDeadline(LocalDate.parse(cols[10].trim())); } catch (Exception ignored) {}
        }
        i.setStatus(Internship.Status.ACTIVE);
        i.setPostedByEmail(adminEmail);
        return i;
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> "";
        };
    }

    private double getCellDouble(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return 0;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING  -> parseDouble(cell.getStringCellValue());
            default      -> 0;
        };
    }

    private Double parseDouble(String s) {
        try { return Double.parseDouble(s.trim().replaceAll("[^0-9.]", "")); }
        catch (Exception e) { return null; }
    }

    private Integer parseInt(String s) {
        try { return Integer.parseInt(s.trim().replaceAll("[^0-9]", "")); }
        catch (Exception e) { return null; }
    }

    // Handle quoted CSV fields
    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (char c : line.toCharArray()) {
            if (c == '"') { inQuotes = !inQuotes; }
            else if (c == ',' && !inQuotes) { result.add(sb.toString()); sb = new StringBuilder(); }
            else { sb.append(c); }
        }
        result.add(sb.toString());
        return result.toArray(new String[0]);
    }
}
