package com.damjan.scheduler_mycelium.domain.account.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    @Schema(description = "Account role", example = "CUSTOMER", allowableValues = {"CUSTOMER", "BUSINESS_OWNER", "STAFF"})
    private String role;
}
