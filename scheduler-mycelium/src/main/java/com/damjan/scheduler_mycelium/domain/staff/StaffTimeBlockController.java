package com.damjan.scheduler_mycelium.domain.staff;

import com.damjan.scheduler_mycelium.domain.staff.dto.CreateTimeBlockRequestDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.TimeBlockResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessPublicId}/staff/{staffPublicId}/blocks")
@RequiredArgsConstructor
public class StaffTimeBlockController {

    private final StaffTimeBlockService staffTimeBlockService;

    @PostMapping
    public ResponseEntity<TimeBlockResponseDTO> createBlock(
            @PathVariable UUID businessPublicId,
            @PathVariable UUID staffPublicId,
            @Valid @RequestBody CreateTimeBlockRequestDTO request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(staffTimeBlockService.createBlock(businessPublicId, staffPublicId, request, auth));
    }

    @GetMapping
    public ResponseEntity<List<TimeBlockResponseDTO>> getBlocks(
            @PathVariable UUID businessPublicId,
            @PathVariable UUID staffPublicId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        return ResponseEntity.ok(staffTimeBlockService.getBlocks(businessPublicId, staffPublicId, date, auth));
    }

    @DeleteMapping("/{blockPublicId}")
    public ResponseEntity<Void> deleteBlock(
            @PathVariable UUID businessPublicId,
            @PathVariable UUID staffPublicId, // Present in URL for consistency
            @PathVariable UUID blockPublicId,
            Authentication auth) {
        staffTimeBlockService.deleteBlock(businessPublicId, blockPublicId, auth);
        return ResponseEntity.noContent().build();
    }
}
