package com.damjan.scheduler_mycelium.calendar;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for {@code GET /api/calendar/status}.
 * Connected is true when the owner has an active Google Calendar token.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalendarStatusDTO {
    private boolean connected;
    /** null when not connected */
    private String googleEmail;
}
