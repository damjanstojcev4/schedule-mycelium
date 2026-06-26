package com.damjan.scheduler_mycelium.domain.service;

import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import com.damjan.scheduler_mycelium.domain.service.dto.CreateServiceRequestDTO;
import com.damjan.scheduler_mycelium.domain.service.dto.ServiceResponseDTO;
import com.damjan.scheduler_mycelium.domain.service.dto.UpdateServiceRequestDTO;
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

@Tag(name = "Services", description = "Services offered by a business (name, duration, price). Nested under /api/businesses/{publicId}/services.")
@RestController
@RequestMapping("/api/businesses/{publicId}/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @Operation(summary = "Create a service", description = "Business owner only.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "201", content = @Content(schema = @Schema(implementation = ServiceResponseDTO.class)))
    @PostMapping
    public ResponseEntity<ServiceResponseDTO> createService(
            @Parameter(description = "Business public ID") @PathVariable UUID publicId,
            @Valid @RequestBody CreateServiceRequestDTO request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceService.createService(publicId, request, auth));
    }

    @Operation(summary = "List active services for a business")
    @ApiResponse(responseCode = "200",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = ServiceResponseDTO.class))))
    @SecurityRequirements
    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> getActiveServices(@PathVariable UUID publicId) {
        return ResponseEntity.ok(serviceService.getActiveServices(publicId));
    }

    @Operation(summary = "List all services for a business (including inactive)")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "200",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = ServiceResponseDTO.class))))
    @GetMapping("/all")
    public ResponseEntity<List<ServiceResponseDTO>> getAllServices(@PathVariable UUID publicId, Authentication auth) {
        return ResponseEntity.ok(serviceService.getAllServices(publicId, auth));
    }

    @Operation(summary = "Update a service")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = ServiceResponseDTO.class)))
    @PutMapping("/{servicePublicId}")
    public ResponseEntity<ServiceResponseDTO> updateService(
            @PathVariable UUID publicId,
            @PathVariable UUID servicePublicId,
            @Valid @RequestBody UpdateServiceRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(serviceService.updateService(publicId, servicePublicId, request, auth));
    }

    @Operation(summary = "Deactivate a service", description = "Soft-delete; service no longer appears in active list.")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "204", description = "Deactivated")
    @DeleteMapping("/{servicePublicId}")
    public ResponseEntity<Void> deactivateService(
            @PathVariable UUID publicId,
            @PathVariable UUID servicePublicId,
            Authentication auth) {
        serviceService.deactivateService(publicId, servicePublicId, auth);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Activate a service")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponse(responseCode = "204", description = "Activated")
    @PatchMapping("/{servicePublicId}/activate")
    public ResponseEntity<Void> activateService(
            @PathVariable UUID publicId,
            @PathVariable UUID servicePublicId,
            Authentication auth) {
        serviceService.activateService(publicId, servicePublicId, auth);
        return ResponseEntity.noContent().build();
    }
}
