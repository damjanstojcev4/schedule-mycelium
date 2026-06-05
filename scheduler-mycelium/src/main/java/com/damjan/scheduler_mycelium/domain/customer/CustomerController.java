package com.damjan.scheduler_mycelium.domain.customer;

import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import com.damjan.scheduler_mycelium.domain.customer.dto.CustomerResponseDTO;
import com.damjan.scheduler_mycelium.domain.customer.dto.UpdateCustomerRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Customers", description = "Customer profile for the logged-in CUSTOMER account. Requires JWT.")
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class CustomerController {

    private final CustomerService customerService;

    @Operation(summary = "Get my profile")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = CustomerResponseDTO.class)))
    @GetMapping("/me")
    public ResponseEntity<CustomerResponseDTO> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(customerService.getMyProfile(auth));
    }

    @Operation(summary = "Update my profile")
    @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = CustomerResponseDTO.class)))
    @PutMapping("/me")
    public ResponseEntity<CustomerResponseDTO> updateMyProfile(
            @Valid @RequestBody UpdateCustomerRequestDTO request,
            Authentication auth) {
        return ResponseEntity.ok(customerService.updateMyProfile(request, auth));
    }
}
