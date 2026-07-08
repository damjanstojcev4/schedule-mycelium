package com.damjan.scheduler_mycelium.domain.report;

import com.damjan.scheduler_mycelium.config.OpenApiConfig;
import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.domain.report.dto.BusinessReportDTO;
import com.damjan.scheduler_mycelium.exception.BusinessNotFoundException;
import com.damjan.scheduler_mycelium.security.TenantGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@Tag(name = "Reports", description = "Business analytics and reporting. Requires BUSINESS_OWNER JWT.")
@RestController
@RequestMapping("/api/businesses/{businessPublicId}/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ReportController {

    private final ReportService      reportService;
    private final TenantGuard        tenantGuard;
    private final BusinessRepository businessRepository;

    /**
     * GET /api/businesses/{businessPublicId}/reports
     *
     * Query params:
     *   from  - start date inclusive (YYYY-MM-DD), defaults to first day of current month
     *   to    - end date inclusive   (YYYY-MM-DD), defaults to today
     *
     * Returns a {@link BusinessReportDTO} with volume, trend, service breakdown
     * and time-pattern heatmaps for the requested period.
     */
    @Operation(
            summary     = "Get business analytics report",
            description = "Returns aggregated analytics for the authenticated business owner. " +
                          "Defaults to the current calendar month when no date range is specified."
    )
    @ApiResponse(responseCode = "200",
            content = @Content(schema = @Schema(implementation = BusinessReportDTO.class)))
    @ApiResponse(responseCode = "403", description = "Not the owner of this business")
    @ApiResponse(responseCode = "404", description = "Business not found")
    @GetMapping
    public ResponseEntity<BusinessReportDTO> getReport(
            @Parameter(description = "Business public UUID")
            @PathVariable UUID businessPublicId,

            @Parameter(description = "Report start date (inclusive), format YYYY-MM-DD. Defaults to first day of current month.")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @Parameter(description = "Report end date (inclusive), format YYYY-MM-DD. Defaults to today.")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            Authentication auth
    ) {
        // Security: only the owner (or SUPER_ADMIN) may view their own reports
        tenantGuard.assertOwner(businessPublicId, auth);

        // Resolve the internal business ID
        Long businessId = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found: " + businessPublicId))
                .getId();

        // Default date range: current calendar month
        LocalDate now      = LocalDate.now();
        LocalDate fromDate = (from != null) ? from : now.withDayOfMonth(1);
        LocalDate toDate   = (to   != null) ? to   : now;

        // Guard against inverted ranges
        if (fromDate.isAfter(toDate)) {
            fromDate = toDate;
        }

        return ResponseEntity.ok(reportService.buildReport(businessId, fromDate, toDate));
    }
}
