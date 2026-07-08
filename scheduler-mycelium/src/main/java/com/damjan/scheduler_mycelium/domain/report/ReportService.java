package com.damjan.scheduler_mycelium.domain.report;

import com.damjan.scheduler_mycelium.domain.appointment.Appointment;
import com.damjan.scheduler_mycelium.domain.appointment.AppointmentRepository;
import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.domain.report.dto.BusinessReportDTO;
import com.damjan.scheduler_mycelium.domain.report.dto.ServiceStatDTO;
import com.damjan.scheduler_mycelium.exception.BusinessNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AppointmentRepository appointmentRepository;
    private final BusinessRepository    businessRepository;

    /**
     * Compute analytics for a business over [from, to].
     * All timestamps are treated as local (no timezone conversion).
     *
     * @param businessId internal PK of the business
     * @param from       start of period (inclusive), local date
     * @param to         end of period   (inclusive), local date
     */
    @Transactional(readOnly = true)
    public BusinessReportDTO buildReport(Long businessId, LocalDate from, LocalDate to) {

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt   = to.plusDays(1).atStartOfDay(); // exclusive upper bound

        List<Appointment> appointments =
                appointmentRepository.findByBusinessIdAndStartTimeBetween(businessId, fromDt, toDt);

        // ── Volume ────────────────────────────────────────────────────────────
        int total     = appointments.size();
        int completed = (int) appointments.stream().filter(a -> a.getStatus() == Appointment.Status.COMPLETED).count();
        int cancelled = (int) appointments.stream().filter(a -> a.getStatus() == Appointment.Status.CANCELLED).count();
        double cancelRate = total > 0 ? Math.round((cancelled * 1000.0) / total) / 10.0 : 0.0;

        // ── Avg per day ───────────────────────────────────────────────────────
        long days = ChronoUnit.DAYS.between(from, to) + 1;
        double avgPerDay = days > 0 ? Math.round((total * 10.0) / days) / 10.0 : 0.0;

        // ── Previous period (same duration, shifted back) ──────────────────
        LocalDate prevTo   = from.minusDays(1);
        LocalDate prevFrom = prevTo.minusDays(days - 1);
        List<Appointment> prevAppointments = appointmentRepository.findByBusinessIdAndStartTimeBetween(
                businessId, prevFrom.atStartOfDay(), from.atStartOfDay());
        int prevTotal     = prevAppointments.size();
        int trendPercent  = prevTotal == 0
                ? (total > 0 ? 100 : 0)
                : (int) Math.round(((double)(total - prevTotal) / prevTotal) * 100);

        // ── Top services ──────────────────────────────────────────────────────
        Map<String, Long> svcCounts = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getService().getName(),
                        Collectors.counting()
                ));
        List<ServiceStatDTO> topServices = svcCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new ServiceStatDTO(
                        e.getKey(),
                        e.getValue().intValue(),
                        total > 0 ? Math.round((e.getValue() * 1000.0) / total) / 10.0 : 0.0
                ))
                .collect(Collectors.toList());

        // ── Day-of-week heatmap ───────────────────────────────────────────────
        // Use 3-letter ISO abbreviation: Mon, Tue, Wed, Thu, Fri, Sat, Sun
        Map<String, Integer> bookingsByDow = new LinkedHashMap<>();
        // Pre-fill in ISO order so the map is always ordered
        for (DayOfWeek dow : DayOfWeek.values()) {
            bookingsByDow.put(dow.getDisplayName(TextStyle.SHORT, Locale.ENGLISH), 0);
        }
        appointments.forEach(a -> {
            String key = a.getStartTime().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            bookingsByDow.merge(key, 1, Integer::sum);
        });

        String busiestDow = bookingsByDow.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey)
                .orElse("");

        // ── Hour-of-day heatmap ───────────────────────────────────────────────
        Map<Integer, Integer> bookingsByHour = new TreeMap<>();
        appointments.forEach(a -> bookingsByHour.merge(a.getStartTime().getHour(), 1, Integer::sum));

        int busiestHour = bookingsByHour.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(-1);

        return new BusinessReportDTO(
                total, completed, cancelled, cancelRate,
                prevTotal, trendPercent,
                avgPerDay,
                topServices,
                bookingsByDow, bookingsByHour,
                busiestDow, busiestHour
        );
    }
}
