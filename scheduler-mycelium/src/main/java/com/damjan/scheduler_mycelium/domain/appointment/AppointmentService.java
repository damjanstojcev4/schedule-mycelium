package com.damjan.scheduler_mycelium.domain.appointment;

import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.appointment.dto.AppointmentResponseDTO;
import com.damjan.scheduler_mycelium.domain.appointment.dto.BookAppointmentRequestDTO;
import com.damjan.scheduler_mycelium.domain.business.Business;
import com.damjan.scheduler_mycelium.domain.business.BusinessSettings;
import com.damjan.scheduler_mycelium.domain.business.BusinessSettingsRepository;
import com.damjan.scheduler_mycelium.domain.customer.Customer;
import com.damjan.scheduler_mycelium.domain.customer.CustomerRepository;
import com.damjan.scheduler_mycelium.domain.service.Service;
import com.damjan.scheduler_mycelium.domain.service.ServiceRepository;
import com.damjan.scheduler_mycelium.domain.staff.StaffMember;
import com.damjan.scheduler_mycelium.domain.staff.StaffMemberRepository;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import com.damjan.scheduler_mycelium.exception.SlotNotAvailableException;
import com.damjan.scheduler_mycelium.scheduling.SlotAvailabilityService;
import com.damjan.scheduler_mycelium.security.TenantGuard;
import com.damjan.scheduler_mycelium.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final BusinessSettingsRepository businessSettingsRepository;
    private final SlotAvailabilityService slotAvailabilityService;
    private final TenantGuard tenantGuard;

    @Transactional
    public AppointmentResponseDTO bookAppointment(BookAppointmentRequestDTO request, Authentication auth) {
        Long accountId = ((UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal()).getAccountId();

        Customer customer = customerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        Service service = serviceRepository.findByPublicId(request.getServicePublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!service.getIsActive()) {
            throw new IllegalArgumentException("Service is not active");
        }

        StaffMember staff = staffMemberRepository.findByPublicId(request.getStaffPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        Business business = staff.getBusiness();

        if (!service.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Service and Staff must belong to the same business");
        }

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        if (!slotAvailabilityService.isSlotAvailable(staff.getId(), startTime, endTime)) {
            throw new SlotNotAvailableException("The requested slot is not available");
        }

        Appointment appointment = new Appointment();
        appointment.setBusiness(business);
        appointment.setStaffMember(staff);
        appointment.setCustomer(customer);
        appointment.setService(service);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setStatus(Appointment.Status.BOOKED);
        appointment.setNotes(request.getNotes());

        appointment = appointmentRepository.save(appointment);

        return mapToAppointmentResponse(appointment);
    }

    @Transactional
    public AppointmentResponseDTO bookGuestAppointment(
            Business business,
            Service service,
            StaffMember staff,
            LocalDateTime startTime,
            String guestName,
            String guestEmail,
            String guestPhone,
            String notes
    ) {
        if (!service.getIsActive()) {
            throw new IllegalArgumentException("Service is not active");
        }

        if (!service.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Service does not belong to this business");
        }

        if (!staff.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        LocalDateTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        if (!slotAvailabilityService.isSlotAvailable(staff.getId(), startTime, endTime)) {
            throw new SlotNotAvailableException("The requested slot is not available");
        }

        Appointment appointment = new Appointment();
        appointment.setBusiness(business);
        appointment.setStaffMember(staff);
        appointment.setCustomer(null);
        appointment.setGuestName(guestName);
        appointment.setGuestEmail(guestEmail);
        appointment.setGuestPhone(guestPhone);
        appointment.setService(service);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setStatus(Appointment.Status.BOOKED);
        appointment.setNotes(notes);

        appointment = appointmentRepository.save(appointment);

        return mapToAppointmentResponse(appointment);
    }

    @Transactional
    public void cancelAppointment(UUID appointmentPublicId, Authentication auth) {
        UserDetailsServiceImpl.CustomUserDetails userDetails =
                (UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal();
        Account.Role role = userDetails.getRole();

        Appointment appointment = appointmentRepository.findByPublicId(appointmentPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() != Appointment.Status.BOOKED) {
            throw new IllegalArgumentException("Only booked appointments can be cancelled");
        }

        if (role == Account.Role.SUPER_ADMIN) {
            appointment.setStatus(Appointment.Status.CANCELLED);
            appointment.setCancelledBy(Appointment.CancelledBy.BUSINESS_OWNER);
            appointmentRepository.save(appointment);
            return;
        }

        Appointment.CancelledBy cancelledBy = switch (role) {
            case CUSTOMER -> Appointment.CancelledBy.CUSTOMER;
            case STAFF -> Appointment.CancelledBy.STAFF;
            case BUSINESS_OWNER -> Appointment.CancelledBy.BUSINESS_OWNER;
            default -> throw new AccessDeniedException("Cannot cancel appointment");
        };

        Long accountId = userDetails.getAccountId();

        if (cancelledBy == Appointment.CancelledBy.CUSTOMER) {
            if (appointment.getCustomer() == null
                    || !appointment.getCustomer().getAccount().getId().equals(accountId)) {
                throw new AccessDeniedException("You do not own this appointment");
            }

            BusinessSettings settings = businessSettingsRepository.findByBusinessId(appointment.getBusiness().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Settings not found"));

            LocalDateTime cutoffTime = appointment.getStartTime().minusHours(settings.getCancellationCutoffHours());
            if (LocalDateTime.now().isAfter(cutoffTime)) {
                throw new IllegalArgumentException("It's too late to cancel this appointment");
            }
        } else if (cancelledBy == Appointment.CancelledBy.STAFF || cancelledBy == Appointment.CancelledBy.BUSINESS_OWNER) {
            if (cancelledBy == Appointment.CancelledBy.BUSINESS_OWNER) {
                tenantGuard.assertOwner(appointment.getBusiness().getPublicId(), auth);
            } else {
                tenantGuard.assertStaffBelongsToBusiness(
                        appointment.getStaffMember().getPublicId(),
                        appointment.getBusiness().getPublicId(),
                        auth
                );
            }
        }

        appointment.setStatus(Appointment.Status.CANCELLED);
        appointment.setCancelledBy(cancelledBy);
        appointmentRepository.save(appointment);
    }

    @Transactional
    public void completeAppointment(UUID appointmentPublicId, Authentication auth) {
        Appointment appointment = appointmentRepository.findByPublicId(appointmentPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        UserDetailsServiceImpl.CustomUserDetails userDetails =
                (UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal();
        Account.Role role = userDetails.getRole();

        if (role != Account.Role.SUPER_ADMIN) {
            boolean isOwner = false;
            try {
                tenantGuard.assertOwner(appointment.getBusiness().getPublicId(), auth);
                isOwner = true;
            } catch (AccessDeniedException e) {
                // Not owner
            }

            if (!isOwner) {
                tenantGuard.assertStaffBelongsToBusiness(
                        appointment.getStaffMember().getPublicId(),
                        appointment.getBusiness().getPublicId(),
                        auth
                );
            }
        }

        if (appointment.getStatus() != Appointment.Status.BOOKED) {
            throw new IllegalArgumentException("Only booked appointments can be completed");
        }

        appointment.setStatus(Appointment.Status.COMPLETED);
        appointmentRepository.save(appointment);
    }

    public List<AppointmentResponseDTO> getMyAppointments(Authentication auth) {
        UserDetailsServiceImpl.CustomUserDetails userDetails = (UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal();
        Long accountId = userDetails.getAccountId();

        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        List<Appointment> appointments;

        if (role.equals("ROLE_SUPER_ADMIN")) {
            appointments = appointmentRepository.findAll();
        } else if (role.equals("ROLE_CUSTOMER")) {
            Customer customer = customerRepository.findByAccountId(accountId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
            appointments = appointmentRepository.findByCustomerId(customer.getId());
        } else if (role.equals("ROLE_STAFF")) {
            StaffMember staff = staffMemberRepository.findByAccountId(accountId)
                    .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found"));
            appointments = appointmentRepository.findByStaffMemberId(staff.getId());
        } else if (role.equals("ROLE_BUSINESS_OWNER")) {
            // For now, return all appointments across their businesses, or just empty if not fully implemented
            appointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getBusiness().getOwner().getId().equals(accountId))
                .collect(Collectors.toList());
        } else {
            throw new AccessDeniedException("Unknown role");
        }

        return appointments.stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDTO getAppointmentByPublicId(UUID publicId, Authentication auth) {
        Appointment appointment = appointmentRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        UserDetailsServiceImpl.CustomUserDetails userDetails = (UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal();
        Long accountId = userDetails.getAccountId();
        Account.Role role = userDetails.getRole();

        if (role == Account.Role.SUPER_ADMIN) {
            return mapToAppointmentResponse(appointment);
        }

        if (role == Account.Role.CUSTOMER) {
            if (appointment.getCustomer() == null
                    || !appointment.getCustomer().getAccount().getId().equals(accountId)) {
                throw new AccessDeniedException("Access denied");
            }
        } else if (role == Account.Role.STAFF) {
            StaffMember staff = staffMemberRepository.findByAccountId(accountId)
                    .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found"));
            if (!appointment.getStaffMember().getId().equals(staff.getId())) {
                throw new AccessDeniedException("Access denied");
            }
        } else if (role == Account.Role.BUSINESS_OWNER) {
            tenantGuard.assertOwner(appointment.getBusiness().getPublicId(), auth);
        }

        return mapToAppointmentResponse(appointment);
    }

    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDTO mapToAppointmentResponse(Appointment appointment) {
        String customerName = appointment.getCustomer() != null
                ? appointment.getCustomer().getFullName()
                : null;

        return new AppointmentResponseDTO(
                appointment.getPublicId(),
                appointment.getBusiness().getPublicId(),
                appointment.getStaffMember().getName(),
                customerName,
                appointment.getGuestName(),
                appointment.getGuestEmail(),
                appointment.getGuestPhone(),
                appointment.getService().getName(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getStatus().name(),
                appointment.getCancelledBy() != null ? appointment.getCancelledBy().name() : null,
                appointment.getNotes(),
                appointment.getCreatedAt(),
                appointment.getBusiness().getName(),
                appointment.getBusiness().getSlug()
        );
    }
}
