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
    public StaffResponseDTO addStaff(Long businessId, CreateStaffRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with id: " + businessId));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + request.getAccountId()));

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

    public List<StaffResponseDTO> getStaffByBusiness(Long businessId) {
        return staffMemberRepository.findByBusinessId(businessId).stream()
                .map(this::mapToStaffResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StaffResponseDTO updateStaff(Long businessId, Long staffId, UpdateStaffRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        StaffMember staff = staffMemberRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + staffId));

        if (!staff.getBusiness().getId().equals(businessId)) {
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
    public void removeStaff(Long businessId, Long staffId, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        StaffMember staff = staffMemberRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + staffId));

        if (!staff.getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        staffMemberRepository.delete(staff);
    }

    @Transactional
    public StaffDayOffResponseDTO addDayOff(Long businessId, Long staffId, StaffDayOffRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        StaffMember staff = staffMemberRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + staffId));

        if (!staff.getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        StaffDayOff dayOff = new StaffDayOff();
        dayOff.setStaffMember(staff);
        dayOff.setDayOff(request.getDayOff());

        dayOff = staffDayOffRepository.save(dayOff);

        return new StaffDayOffResponseDTO(
                dayOff.getId(),
                dayOff.getStaffMember().getId(),
                dayOff.getDayOff()
        );
    }

    @Transactional
    public void removeDayOff(Long businessId, Long dayOffId, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        StaffDayOff dayOff = staffDayOffRepository.findById(dayOffId)
                .orElseThrow(() -> new ResourceNotFoundException("Day off not found with id: " + dayOffId));

        if (!dayOff.getStaffMember().getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("Staff member does not belong to this business");
        }

        staffDayOffRepository.delete(dayOff);
    }

    private StaffResponseDTO mapToStaffResponse(StaffMember staff) {
        return new StaffResponseDTO(
                staff.getId(),
                staff.getAccount().getId(),
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
