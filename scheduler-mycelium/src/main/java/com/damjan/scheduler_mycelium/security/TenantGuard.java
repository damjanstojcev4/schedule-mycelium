package com.damjan.scheduler_mycelium.security;

import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.domain.staff.StaffMemberRepository;
import com.damjan.scheduler_mycelium.exception.BusinessNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TenantGuard {

    private final BusinessRepository businessRepository;
    private final StaffMemberRepository staffMemberRepository;

    public void assertOwner(UUID businessPublicId, Authentication auth) {
        Account.Role role = ((UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal()).getRole();
        if (role == Account.Role.SUPER_ADMIN) {
            return;
        }

        Long accountId = extractAccountId(auth);
        com.damjan.scheduler_mycelium.domain.business.Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        if (!business.getOwner().getId().equals(accountId)) {
            throw new AccessDeniedException("You do not have permission to access this business.");
        }
    }

    public void assertStaffBelongsToBusiness(UUID staffPublicId, UUID businessPublicId) {
        Long businessId = businessRepository.findByPublicId(businessPublicId)
                .map(b -> b.getId())
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        boolean belongs = staffMemberRepository.findByPublicId(staffPublicId)
                .map(staff -> staff.getBusiness().getId().equals(businessId))
                .orElse(false);

        if (!belongs) {
            throw new AccessDeniedException("Staff member does not belong to the given business.");
        }
    }

    public void assertStaffBelongsToBusiness(UUID staffPublicId, UUID businessPublicId, Authentication auth) {
        Account.Role role = ((UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal()).getRole();
        if (role == Account.Role.SUPER_ADMIN) {
            return;
        }
        assertStaffBelongsToBusiness(staffPublicId, businessPublicId);
    }

    private Long extractAccountId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new AccessDeniedException("Authentication is required.");
        }

        if (auth.getPrincipal() instanceof UserDetailsServiceImpl.CustomUserDetails userDetails) {
            return userDetails.getAccountId();
        }

        throw new AccessDeniedException("Invalid authentication principal.");
    }
}
