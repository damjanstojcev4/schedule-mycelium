package com.damjan.scheduler_mycelium.domain.account.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private UUID publicId;
    private String email;
    private String fullName;  // Customer full name; null for non-CUSTOMER roles
    private String role;
    private String slug;  // Business slug for BUSINESS_OWNER/STAFF, null otherwise
    private UUID businessPublicId; // Business publicId for BUSINESS_OWNER/STAFF
}
