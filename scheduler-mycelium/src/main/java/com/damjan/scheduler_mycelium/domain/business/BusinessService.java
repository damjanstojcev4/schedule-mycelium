package com.damjan.scheduler_mycelium.domain.business;

import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.account.AccountRepository;
import com.damjan.scheduler_mycelium.domain.business.dto.*;
import com.damjan.scheduler_mycelium.exception.BusinessNotFoundException;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import com.damjan.scheduler_mycelium.security.TenantGuard;
import com.damjan.scheduler_mycelium.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final BusinessSettingsRepository businessSettingsRepository;
    private final BusinessClosureRepository businessClosureRepository;
    private final AccountRepository accountRepository;
    private final TenantGuard tenantGuard;

    @Transactional
    public BusinessResponseDTO createBusiness(CreateBusinessRequestDTO request, Authentication auth) {
        Long accountId = ((UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal()).getAccountId();
        Account owner = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Business business = new Business();
        business.setOwner(owner);
        business.setName(request.getName());
        business.setCategory(request.getCategory());
        business.setPhone(request.getPhone());
        business.setAddress(request.getAddress());
        business.setDescription(request.getDescription());

        business = businessRepository.save(business);

        BusinessSettings settings = new BusinessSettings();
        settings.setBusiness(business);
        settings.setCancellationCutoffHours(24);
        settings.setSlotIntervalMinutes(15);
        businessSettingsRepository.save(settings);

        return mapToBusinessResponse(business);
    }

    public BusinessResponseDTO getBusinessById(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with id: " + id));
        return mapToBusinessResponse(business);
    }

    public List<BusinessResponseDTO> getAllBusinesses() {
        return businessRepository.findAll().stream()
                .map(this::mapToBusinessResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BusinessSettingsResponseDTO updateSettings(Long businessId, BusinessSettingsRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        BusinessSettings settings = businessSettingsRepository.findByBusinessId(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found for business"));

        settings.setCancellationCutoffHours(request.getCancellationCutoffHours());
        settings.setSlotIntervalMinutes(request.getSlotIntervalMinutes());

        settings = businessSettingsRepository.save(settings);

        return new BusinessSettingsResponseDTO(
                settings.getId(),
                settings.getBusiness().getId(),
                settings.getCancellationCutoffHours(),
                settings.getSlotIntervalMinutes()
        );
    }

    @Transactional
    public BusinessClosureResponseDTO addClosure(Long businessId, BusinessClosureRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with id: " + businessId));

        BusinessClosure closure = new BusinessClosure();
        closure.setBusiness(business);
        closure.setClosureDate(request.getClosureDate());
        closure.setReason(request.getReason());

        closure = businessClosureRepository.save(closure);

        return new BusinessClosureResponseDTO(
                closure.getId(),
                closure.getClosureDate(),
                closure.getReason()
        );
    }

    public List<BusinessClosureResponseDTO> getClosures(Long businessId) {
        return businessClosureRepository.findByBusinessId(businessId).stream()
                .map(closure -> new BusinessClosureResponseDTO(
                        closure.getId(),
                        closure.getClosureDate(),
                        closure.getReason()
                ))
                .collect(Collectors.toList());
    }

    private BusinessResponseDTO mapToBusinessResponse(Business business) {
        return new BusinessResponseDTO(
                business.getId(),
                business.getName(),
                business.getCategory(),
                business.getPhone(),
                business.getAddress(),
                business.getDescription(),
                business.getCreatedAt()
        );
    }
}
