package com.damjan.scheduler_mycelium.domain.staff;

import com.damjan.scheduler_mycelium.domain.staff.dto.StaffScheduleResponseDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.UpdateStaffScheduleRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/businesses/{businessPublicId}/staff/{staffPublicId}/schedule")
@RequiredArgsConstructor
public class StaffScheduleController {

    private final StaffScheduleService staffScheduleService;

    @GetMapping
    public ResponseEntity<StaffScheduleResponseDTO> getSchedule(
            @PathVariable UUID businessPublicId,
            @PathVariable UUID staffPublicId,
            Authentication auth) {
        return ResponseEntity.ok(staffScheduleService.getSchedule(businessPublicId, staffPublicId, auth));
    }

    @PutMapping
    public ResponseEntity<StaffScheduleResponseDTO> updateSchedule(
            @PathVariable UUID businessPublicId,
            @PathVariable UUID staffPublicId,
            @Valid @RequestBody UpdateStaffScheduleRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(staffScheduleService.updateSchedule(businessPublicId, staffPublicId, request, auth));
    }
}
