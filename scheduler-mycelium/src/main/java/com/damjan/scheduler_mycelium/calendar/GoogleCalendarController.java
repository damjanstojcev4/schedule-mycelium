package com.damjan.scheduler_mycelium.calendar;

import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.security.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

/**
 * REST controller for Google Calendar OAuth integration.
 *
 * <p>Endpoints:
 * <ul>
 *   <li>{@code GET  /api/calendar/connect}    — returns the Google consent screen URL</li>
 *   <li>{@code GET  /api/calendar/callback}   — public; Google redirects here after consent</li>
 *   <li>{@code GET  /api/calendar/status}     — returns connection status + Google email</li>
 *   <li>{@code DELETE /api/calendar/disconnect} — removes stored tokens</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarController {

    private final GoogleCalendarService googleCalendarService;
    private final BusinessRepository businessRepository;

    /**
     * Returns the Google OAuth consent URL.
     * The frontend should redirect the browser to this URL.
     */
    @GetMapping("/connect")
    public ResponseEntity<Map<String, String>> connect(Authentication auth) {
        Long accountId = extractAccountId(auth);
        String authUrl = googleCalendarService.buildAuthorizationUrl(accountId);
        return ResponseEntity.ok(Map.of("authorizationUrl", authUrl));
    }

    /**
     * Google redirects here after the owner grants (or denies) consent.
     * <p>
     * This endpoint is PUBLIC — Google posts here without a JWT.
     * Security is provided by the {@code state} parameter (= accountId),
     * which was generated server-side and cannot be forged.
     */
    @GetMapping("/callback")
    public void callback(
            @RequestParam String code,
            @RequestParam String state,
            HttpServletResponse response) throws IOException {

        try {
            Long accountId = Long.parseLong(state);
            googleCalendarService.exchangeCodeAndSaveToken(code, state);

            // Look up the slug so we redirect to the correct dashboard
            String slug = businessRepository.findSlugByOwnerId(accountId).orElse(null);

            String redirectUrl = slug != null
                ? "https://celium.site/dashboard/" + slug + "/settings?calendar=connected"
                : "https://celium.site/dashboard/settings?calendar=connected";

            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            log.error("Google Calendar OAuth callback failed: {}", e.getMessage(), e);
            response.sendRedirect("https://celium.site/dashboard/settings?calendar=error");
        }
    }

    /**
     * Returns whether the authenticated account has a connected Google Calendar.
     */
    @GetMapping("/status")
    public ResponseEntity<CalendarStatusDTO> status(Authentication auth) {
        Long accountId = extractAccountId(auth);
        return ResponseEntity.ok(googleCalendarService.getStatus(accountId));
    }

    /**
     * Removes stored Google Calendar tokens for the authenticated account.
     */
    @DeleteMapping("/disconnect")
    public ResponseEntity<Void> disconnect(Authentication auth) {
        Long accountId = extractAccountId(auth);
        googleCalendarService.disconnect(accountId);
        return ResponseEntity.noContent().build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Long extractAccountId(Authentication auth) {
        return ((UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal()).getAccountId();
    }
}
