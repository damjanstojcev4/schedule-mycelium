package com.damjan.scheduler_mycelium.domain.business.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminCreateBusinessRequestDTO {

    @NotBlank
    @Email
    private String ownerEmail;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String ownerPassword;

    @NotBlank(message = "Business name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    private String description;

    private Boolean soloOperator = true;
}
