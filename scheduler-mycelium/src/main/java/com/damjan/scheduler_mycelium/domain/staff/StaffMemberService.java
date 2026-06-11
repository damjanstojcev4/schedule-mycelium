package com.damjan.scheduler_mycelium.domain.staff;

import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.account.AccountRepository;
import com.damjan.scheduler_mycelium.domain.business.Business;
import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.domain.staff.dto.*;
import com.damjan.scheduler_mycelium.exception.BusinessNotFoundException;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import com.damjan.scheduler_mycelium.security.TenantGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffMemberService {

    private final StaffMemberRepository staffMemberRepository;
    private final StaffDayOffRepository staffDayOffRepository;
    private final BusinessRepository businessRepository;
    private final AccountRepository accountRepository;
    private final TenantGuard tenantGuard;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StaffResponseDTO addStaff(UUID businessPublicId, CreateStaffRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        String tempPassword = null;
        Account account = accountRepository.findByEmail(request.getEmail()).orElse(null);

        if (account == null) {
            // Auto-create a STAFF account with a random temporary password
            tempPassword = generateTempPassword();
            account = new Account();
            account.setEmail(request.getEmail());
            account.setPasswordHash(passwordEncoder.encode(tempPassword));
            account.setRole(Account.Role.STAFF);
            account = accountRepository.save(account);
        } else if (account.getRole() != Account.Role.STAFF) {
            throw new IllegalArgumentException(
                "An account with email '" + request.getEmail() + "' already exists with role " +
                account.getRole().name() + ". Only STAFF-role accounts can be added as staff members.");
        }

        // Prevent adding the same account to the same business twice
        if (staffMemberRepository.findByBusinessIdAndAccountId(business.getId(), account.getId()).isPresent()) {
            throw new IllegalArgumentException("This account is already a staff member at your business.");
        }

        StaffMember staff = new StaffMember();
        staff.setBusiness(business);
        staff.setAccount(account);
        staff.setName(request.getName());
        staff.setRoleTitle(request.getRoleTitle());
        staff.setWorkStart(request.getWorkStart());
        staff.setWorkEnd(request.getWorkEnd());
        staff.setBreakStart(request.getBreakStart());
        staff.setBreakEnd(request.getBreakEnd());

        staff = staffMemberRepository.save(staff);

        return mapToStaffResponse(staff, tempPassword);
    }

    private static String generateTempPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    public List<StaffResponseDTO> getStaffByBusiness(UUID businessPublicId) {
        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        return staffMemberRepository.findByBusinessId(business.getId()).stream()
                .map(this::mapToStaffResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StaffResponseDTO updateStaff(UUID businessPublicId, UUID staffPublicId, UpdateStaffRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        StaffMember staff = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with publicId: " + staffPublicId));

        if (!staff.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        staff.setName(request.getName());
        staff.setRoleTitle(request.getRoleTitle());
        staff.setWorkStart(request.getWorkStart());
        staff.setWorkEnd(request.getWorkEnd());
        staff.setBreakStart(request.getBreakStart());
        staff.setBreakEnd(request.getBreakEnd());

        staff = staffMemberRepository.save(staff);

        return mapToStaffResponse(staff, null);
    }

    @Transactional
    public void removeStaff(UUID businessPublicId, UUID staffPublicId, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        StaffMember staff = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with publicId: " + staffPublicId));

        if (!staff.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        staffMemberRepository.delete(staff);
    }

    @Transactional
    public StaffDayOffResponseDTO addDayOff(UUID businessPublicId, UUID staffPublicId, StaffDayOffRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        StaffMember staff = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with publicId: " + staffPublicId));

        if (!staff.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        StaffDayOff dayOff = new StaffDayOff();
        dayOff.setStaffMember(staff);
        dayOff.setDayOff(request.getDayOff());

        dayOff = staffDayOffRepository.save(dayOff);

        return new StaffDayOffResponseDTO(
                dayOff.getId(),
                staff.getPublicId(),
                dayOff.getDayOff()
        );
    }

    @Transactional
    public void removeDayOff(UUID businessPublicId, Long dayOffId, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        StaffDayOff dayOff = staffDayOffRepository.findById(dayOffId)
                .orElseThrow(() -> new ResourceNotFoundException("Day off not found with id: " + dayOffId));

        if (!dayOff.getStaffMember().getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        staffDayOffRepository.delete(dayOff);
    }

    public StaffResponseDTO mapToStaffResponse(StaffMember staff) {
        return mapToStaffResponse(staff, null);
    }

    public StaffResponseDTO mapToStaffResponse(StaffMember staff, String tempPassword) {
        return new StaffResponseDTO(
                staff.getPublicId(),
                staff.getAccount().getPublicId(),
                staff.getAccount().getEmail(),
                staff.getName(),
                staff.getRoleTitle(),
                staff.getWorkStart(),
                staff.getWorkEnd(),
                staff.getBreakStart(),
                staff.getBreakEnd(),
                staff.getCreatedAt(),
                tempPassword
        );
    }
}
