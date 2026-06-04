package com.damjan.scheduler_mycelium.security;

import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.domain.staff.StaffMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantGuard {

    private final BusinessRepository businessRepository;
    private final StaffMemberRepository staffMemberRepository;

    public void assertOwner(Long businessId, Authentication auth) {
        Long accountId = extractAccountId(auth);
        
        boolean isOwner = businessRepository.existsByIdAndOwnerId(businessId, accountId);
        
        if (!isOwner) {
            throw new AccessDeniedException("You do not have permission to access this business.");
        }
    }

    public void assertStaffBelongsToBusiness(Long staffMemberId, Long businessId) {
        boolean belongs = staffMemberRepository.findById(staffMemberId)
                .map(staff -> staff.getBusiness().getId().equals(businessId))
                .orElse(false);

        if (!belongs) {
            throw new AccessDeniedException("Staff member does not belong to the given business.");
        }
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
