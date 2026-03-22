package com.internship.portal.controller;
import com.internship.portal.service.DiscoveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/discovery") @CrossOrigin(origins="http://localhost:3000")
public class DiscoveryController {
    @Autowired private DiscoveryService discoveryService;
    @PostMapping("/search-history") public ResponseEntity<?> addHistory(@RequestBody Map<String,String> b, Authentication a) { return ResponseEntity.ok(discoveryService.addSearchHistory((String)a.getPrincipal(), b.get("keyword"))); }
    @GetMapping("/search-history") public ResponseEntity<?> getHistory(Authentication a) { return ResponseEntity.ok(discoveryService.getSearchHistory((String)a.getPrincipal())); }
    @DeleteMapping("/search-history") public ResponseEntity<?> clearHistory(Authentication a) { return ResponseEntity.ok(discoveryService.clearSearchHistory((String)a.getPrincipal())); }
    @PostMapping("/save-filter") public ResponseEntity<?> saveFilter(@RequestBody Map<String,Object> b, Authentication a) { return ResponseEntity.ok(discoveryService.saveFilterPreset((String)a.getPrincipal(),(String)b.get("name"),b)); }
    @GetMapping("/saved-filters") public ResponseEntity<?> getFilters(Authentication a) { return ResponseEntity.ok(discoveryService.getSavedFilters((String)a.getPrincipal())); }
    @DeleteMapping("/saved-filters/{name}") public ResponseEntity<?> deleteFilter(@PathVariable String name, Authentication a) { return ResponseEntity.ok(discoveryService.deleteFilterPreset((String)a.getPrincipal(),name)); }
    @GetMapping("/skill/{skill}") public ResponseEntity<?> bySkill(@PathVariable String skill) { return ResponseEntity.ok(discoveryService.searchBySkill(skill)); }
    @PostMapping("/follow-company") public ResponseEntity<?> follow(@RequestBody Map<String,String> b, Authentication a) { return ResponseEntity.ok(discoveryService.toggleFollowCompany((String)a.getPrincipal(),b.get("company"))); }
    @GetMapping("/followed-companies") public ResponseEntity<?> followed(Authentication a) { return ResponseEntity.ok(discoveryService.getFollowedCompanies((String)a.getPrincipal())); }
    @GetMapping("/alumni") public ResponseEntity<?> alumni() { return ResponseEntity.ok(discoveryService.getAlumniNetwork()); }
    @GetMapping("/map") public ResponseEntity<?> map() { return ResponseEntity.ok(discoveryService.getInternshipsForMap()); }
}
