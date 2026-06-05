package com.damjan.scheduler_mycelium.domain.business;

import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessClosureRequestDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessClosureResponseDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessResponseDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessSettingsRequestDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessSettingsResponseDTO;
import com.damjan.scheduler_mycelium.domain.business.dto.CreateBusinessRequestDTO;
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
    @PostMapping
    public ResponseEntity<BusinessResponseDTO> createBusiness(@Valid @RequestBody CreateBusinessRequestDTO request,
                                                                Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businessService.createBusiness(request, auth));
    }

    @Operation(summary = "List all businesses")
    @ApiResponse(responseCode = "200", description = "Business list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = BusinessResponseDTO.class))))
    @SecurityRequirements
    @GetMapping
    public ResponseEntity<List<BusinessResponseDTO>> getAllBusinesses() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }

    @Operation(summary = "Get business by ID")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = BusinessResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Business not found")
    @SecurityRequirements
    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponseDTO> getBusinessById(
            @Parameter(description = "Business ID") @PathVariable Long id) {
        return ResponseEntity.ok(businessService.getBusinessById(id));
    }

    @Operation(summary = "Update business settings", description = "Opening hours, slot duration, booking rules. Owner only.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = BusinessSettingsResponseDTO.class)))
    @PutMapping("/{id}/settings")
    public ResponseEntity<BusinessSettingsResponseDTO> updateSettings(
            @PathVariable Long id,
            @Valid @RequestBody BusinessSettingsRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(businessService.updateSettings(id, request, auth));
    }

    @Operation(summary = "Add a closure day", description = "Business-wide day off (e.g. holiday). Owner only.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "201", content = @Content(schema = @Schema(implementation = BusinessClosureResponseDTO.class)))
    @PostMapping("/{id}/closures")
    public ResponseEntity<BusinessClosureResponseDTO> addClosure(
            @PathVariable Long id,
            @Valid @RequestBody BusinessClosureRequestDTO request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(businessService.addClosure(id, request, auth));
    }

    @Operation(summary = "List closure days for a business")
    @ApiResponse(responseCode = "200",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = BusinessClosureResponseDTO.class))))
    @SecurityRequirements
    @GetMapping("/{id}/closures")
    public ResponseEntity<List<BusinessClosureResponseDTO>> getClosures(@PathVariable Long id) {
        return ResponseEntity.ok(businessService.getClosures(id));
    }
}
