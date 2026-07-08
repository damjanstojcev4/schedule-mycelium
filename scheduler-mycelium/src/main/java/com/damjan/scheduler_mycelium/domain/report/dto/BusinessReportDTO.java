package com.damjan.scheduler_mycelium.domain.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessReportDTO {

    // ─── Volume ──────────────────────────────────────────────────────────────

    /** Total appointments booked in the requested period. */
    private int totalBookings;

    /** Appointments with status COMPLETED. */
    private int completedBookings;

    /** Appointments with status CANCELLED. */
    private int cancelledBookings;

    /** cancelledBookings / totalBookings * 100, rounded to 1 decimal. */
    private double cancellationRate;

    // ─── Trends ──────────────────────────────────────────────────────────────

    /**
     * Total bookings for the equal-length period immediately preceding the
     * requested range (used by the frontend to show "+12% vs prior period").
     */
    private int previousPeriodTotal;

    /** Percentage change: ((totalBookings - previousPeriodTotal) / previousPeriodTotal) * 100. */
    private int totalTrendPercent;

    // ─── Averages ────────────────────────────────────────────────────────────

    /** totalBookings / number of days in the period, rounded to 1 decimal. */
    private double avgBookingsPerDay;

    // ─── Service breakdown ───────────────────────────────────────────────────

    /** Top 5 services by booking count for the period, sorted descending. */
    private List<ServiceStatDTO> topServices;

    // ─── Time patterns ───────────────────────────────────────────────────────

    /**
     * Booking counts bucketed by ISO day-of-week abbreviation
     * (Mon, Tue, Wed, Thu, Fri, Sat, Sun).
     */
    private Map<String, Integer> bookingsByDayOfWeek;

    /**
     * Booking counts bucketed by hour-of-day (0–23).
     * Only hours with at least one booking are included.
     */
    private Map<Integer, Integer> bookingsByHour;

    /**
     * Day-of-week name (e.g. "Monday") with the highest booking count.
     * Empty string if no data.
     */
    private String busiestDayOfWeek;

    /**
     * Hour (0–23) with the highest booking count.
     * -1 if no data.
     */
    private int busiestHour;
}
