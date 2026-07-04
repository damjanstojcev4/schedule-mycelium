package com.damjan.scheduler_mycelium.domain.appointment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentStatusScheduler {

    private final AppointmentRepository appointmentRepository;

    // Run every 15 minutes to automatically mark past BOOKED appointments as COMPLETED
    @Scheduled(fixedRate = 900000) // 15 minutes = 15 * 60 * 1000 = 900000 ms
    @Transactional
    public void autoCompletePastAppointments() {
        LocalDateTime now = LocalDateTime.now();
        int updatedCount = appointmentRepository.completePastAppointments(now);
        if (updatedCount > 0) {
            log.info("Automatically marked {} past appointments as COMPLETED", updatedCount);
        }
    }
}
