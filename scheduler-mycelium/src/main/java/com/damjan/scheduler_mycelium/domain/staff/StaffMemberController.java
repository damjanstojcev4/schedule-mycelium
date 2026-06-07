package com.damjan.scheduler_mycelium.domain.staff;

import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import com.damjan.scheduler_mycelium.domain.staff.dto.CreateStaffRequestDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.StaffDayOffRequestDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.StaffDayOffResponseDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.StaffResponseDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.UpdateStaffRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Staff", description = "Staff members and days off for a business. Nested under /api/businesses/{publicId}/staff.")
@RestController
@RequestMapping("/api/businesses/{publicId}/staff")
@RequiredArgsConstructor
public class StaffMemberController {

    private final StaffMemberService staffMemberService;

    @Operation(summary = "Add staff member", description = "Links a STAFF-role account to the business. Owner only.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "201", content = @Content(schema = @Schema(implementation = StaffResponseDTO.class)))
    @PostMapping
    public ResponseEntity<StaffResponseDTO> addStaff(
            @PathVariable UUID publicId,
            @Valid @RequestBody CreateStaffRequestDTO request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(staffMemberService.addStaff(publicId, request, auth));
    }

    @Operation(summary = "List staff for a business")
    @ApiResponse(responseCode = "200",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = StaffResponseDTO.class))))
    @SecurityRequirements
    @GetMapping
    public ResponseEntity<List<StaffResponseDTO>> getStaffByBusiness(@PathVariable UUID publicId) {
        return ResponseEntity.ok(staffMemberService.getStaffByBusiness(publicId));
    }

    @Operation(summary = "Update staff member")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = StaffResponseDTO.class)))
    @PutMapping("/{staffPublicId}")
    public ResponseEntity<StaffResponseDTO> updateStaff(
            @PathVariable UUID publicId,
            @PathVariable UUID staffPublicId,
            @Valid @RequestBody UpdateStaffRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(staffMemberService.updateStaff(publicId, staffPublicId, request, auth));
    }

    @Operation(summary = "Remove staff member")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "204", description = "Removed")
    @DeleteMapping("/{staffPublicId}")
    public ResponseEntity<Void> removeStaff(
            @PathVariable UUID publicId,
            @PathVariable UUID staffPublicId,
            Authentication auth) {
        staffMemberService.removeStaff(publicId, staffPublicId, auth);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Add staff day off", description = "Blocks availability for that staff member on the given date.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "201", content = @Content(schema = @Schema(implementation = StaffDayOffResponseDTO.class)))
    @PostMapping("/{staffPublicId}/days-off")
    public ResponseEntity<StaffDayOffResponseDTO> addDayOff(
            @PathVariable UUID publicId,
            @PathVariable UUID staffPublicId,
            @Valid @RequestBody StaffDayOffRequestDTO request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(staffMemberService.addDayOff(publicId, staffPublicId, request, auth));
    }

    @Operation(summary = "Remove staff day off")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "204", description = "Removed")
    @DeleteMapping("/{staffPublicId}/days-off/{dayOffId}")
    public ResponseEntity<Void> removeDayOff(
            @PathVariable UUID publicId,
            @Parameter(description = "Staff member public ID (path segment for routing)") @PathVariable UUID staffPublicId,
            @PathVariable Long dayOffId,
            Authentication auth) {
        staffMemberService.removeDayOff(publicId, dayOffId, auth);
        return ResponseEntity.noContent().build();
    }
}
