package com.damjan.scheduler_mycelium.domain.business;

import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessClosureRequestDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessClosureResponseDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessResponseDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessSettingsRequestDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessSettingsResponseDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.CreateBusinessRequestDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.UpdateBusinessRequestDTO;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Businesses", description = "Create and manage businesses, settings, and closure dates. Public endpoints; JWT recommended for owner mutations.")
@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    @Operation(
            summary = "Create a business",
            description = "Requires an authenticated BUSINESS_OWNER account. Associates the business with the owner."
    )
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "201", description = "Business created",
            content = @Content(schema = @Schema(implementation = BusinessResponseDTO.class)))
    @ApiResponse(responseCode = "403", description = "Caller is not a BUSINESS_OWNER")
    @PreAuthorize("hasAuthority('ROLE_BUSINESS_OWNER')")
    @PostMapping
    public ResponseEntity<BusinessResponseDTO> createBusiness(@Valid @RequestBody CreateBusinessRequestDTO request,
                                                              Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businessService.createBusiness(request, auth));
    }

    @PutMapping("/{slug}")
    public ResponseEntity<BusinessResponseDTO> updateBusiness(
            @PathVariable String slug,
            @Valid @RequestBody UpdateBusinessRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(businessService.updateBusiness(slug, request, auth));
    }

    @Operation(summary = "List all businesses")
    @ApiResponse(responseCode = "200", description = "Business list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = BusinessResponseDTO.class))))
    @SecurityRequirements
    @GetMapping
    public ResponseEntity<List<BusinessResponseDTO>> getAllBusinesses() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }

    @Operation(summary = "Get business by public ID")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = BusinessResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Business not found")
    @SecurityRequirements
    @GetMapping("/{publicId}")
    public ResponseEntity<BusinessResponseDTO> getBusinessByPublicId(
            @Parameter(description = "Business public ID") @PathVariable UUID publicId) {
        return ResponseEntity.ok(businessService.getBusinessByPublicId(publicId));
    }

    @Operation(summary = "Get business settings", description = "Opening hours, slot duration, booking rules. Owner only.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = BusinessSettingsResponseDTO.class)))
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Business or settings not found")
    @GetMapping("/{publicId}/settings")
    public ResponseEntity<BusinessSettingsResponseDTO> getSettings(
            @PathVariable UUID publicId,
            Authentication auth) {
        return ResponseEntity.ok(businessService.getSettings(publicId, auth));
    }

    @Operation(summary = "Update business settings", description = "Opening hours, slot duration, booking rules. Owner only.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = BusinessSettingsResponseDTO.class)))
    @PutMapping("/{publicId}/settings")
    public ResponseEntity<BusinessSettingsResponseDTO> updateSettings(
            @PathVariable UUID publicId,
            @Valid @RequestBody BusinessSettingsRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(businessService.updateSettings(publicId, request, auth));
    }

    @Operation(summary = "Add a closure day", description = "Business-wide day off (e.g. holiday). Owner only.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "201", content = @Content(schema = @Schema(implementation = BusinessClosureResponseDTO.class)))
    @PostMapping("/{publicId}/closures")
    public ResponseEntity<BusinessClosureResponseDTO> addClosure(
            @PathVariable UUID publicId,
            @Valid @RequestBody BusinessClosureRequestDTO request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businessService.addClosure(publicId, request, auth));
    }

    @Operation(summary = "List closure days for a business")
    @ApiResponse(responseCode = "200",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = BusinessClosureResponseDTO.class))))
    @SecurityRequirements
    @GetMapping("/{publicId}/closures")
    public ResponseEntity<List<BusinessClosureResponseDTO>> getClosures(@PathVariable UUID publicId) {
        return ResponseEntity.ok(businessService.getClosures(publicId));
    }
}
