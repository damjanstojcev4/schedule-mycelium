package com.damjan.scheduler_mycelium.domain.account;

import com.damjan.scheduler_mycelium.domain.account.dto.AuthResponseDTO;
import com.damjan.scheduler_mycelium.domain.account.dto.LoginRequestDTO;
import com.damjan.scheduler_mycelium.domain.account.dto.RegisterRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication", description = "Register accounts and obtain JWT tokens. No authentication required.")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@SecurityRequirements
public class AuthController {

    private final AccountService accountService;

    @Operation(
            summary = "Register a new account",
            description = "Creates an account with role CUSTOMER, BUSINESS_OWNER, or STAFF. "
                    + "CUSTOMER accounts also get a customer profile. Returns a JWT for immediate use."
    )
    @ApiResponse(responseCode = "201", description = "Account created",
            content = @Content(schema = @Schema(implementation = AuthResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Validation error or email already taken")
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.register(request));
    }

    @Operation(summary = "Login", description = "Authenticates with email and password. Returns a JWT.")
    @ApiResponse(responseCode = "201", description = "Authenticated",
            content = @Content(schema = @Schema(implementation = AuthResponseDTO.class)))
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.login(request));
    }
}
