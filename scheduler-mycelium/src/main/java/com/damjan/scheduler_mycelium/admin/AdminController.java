package com.damjan.scheduler_mycelium.admin;

import com.damjan.scheduler_mycelium.admin.dto.AdminAccountResponseDTO;
import com.damjan.scheduler_mycelium.domain.account.AccountService;
import com.damjan.scheduler_mycelium.domain.appointment.AppointmentService;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AppointmentResponseDTO;
import com.damjan.scheduler_mycelium.domain.business.BusinessService;
import com.damjan.scheduler_mycelium.domain.business.dto.BusinessResponseDTO;
import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Admin", description = "Super admin endpoints — requires SUPER_ADMIN role.")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class AdminController {

    private final BusinessService businessService;
    private final AccountService accountService;
    private final AppointmentService appointmentService;

    @Operation(summary = "List all businesses")
    @GetMapping("/businesses")
    public ResponseEntity<List<BusinessResponseDTO>> getAllBusinesses() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }

    @Operation(summary = "Get business by public ID")
    @GetMapping("/businesses/{publicId}")
    public ResponseEntity<BusinessResponseDTO> getBusinessByPublicId(@PathVariable UUID publicId) {
        return ResponseEntity.ok(businessService.getBusinessByPublicId(publicId));
    }

    @Operation(summary = "List all accounts")
    @GetMapping("/accounts")
    public ResponseEntity<List<AdminAccountResponseDTO>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccountsForAdmin());
    }

    @Operation(summary = "List all appointments across all tenants")
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }
}
