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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public StaffResponseDTO addStaff(UUID businessPublicId, CreateStaffRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        Account account = accountRepository.findByPublicId(request.getAccountPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with publicId: " + request.getAccountPublicId()));

        if (account.getRole() != Account.Role.STAFF) {
            throw new IllegalArgumentException("Account must have STAFF role to be added as staff member");
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

        return mapToStaffResponse(staff);
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

        return mapToStaffResponse(staff);
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
        return new StaffResponseDTO(
                staff.getPublicId(),
                staff.getAccount().getPublicId(),
                staff.getName(),
                staff.getRoleTitle(),
                staff.getWorkStart(),
                staff.getWorkEnd(),
                staff.getBreakStart(),
                staff.getBreakEnd(),
                staff.getCreatedAt()
        );
    }
}
