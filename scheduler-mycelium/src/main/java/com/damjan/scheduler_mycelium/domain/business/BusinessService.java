package com.damjan.scheduler_mycelium.domain.business;

import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.account.AccountRepository;
import com.damjan.scheduler_mycelium.domain.business.dto.*;
import com.damjan.scheduler_mycelium.domain.staff.StaffMember;
import com.damjan.scheduler_mycelium.domain.staff.StaffMemberRepository;
import com.damjan.scheduler_mycelium.exception.BusinessNotFoundException;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import com.damjan.scheduler_mycelium.security.TenantGuard;
import com.damjan.scheduler_mycelium.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final BusinessSettingsRepository businessSettingsRepository;
    private final BusinessClosureRepository businessClosureRepository;
    private final AccountRepository accountRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final TenantGuard tenantGuard;

    @Transactional
    public BusinessResponseDTO createBusiness(CreateBusinessRequestDTO request, Authentication auth) {
        Long accountId = ((UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal()).getAccountId();
        Account owner = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        boolean soloOperator = request.getSoloOperator() != null ? request.getSoloOperator() : true;

        Business business = new Business();
        business.setOwner(owner);
        business.setName(request.getName());
        business.setCategory(request.getCategory());
        business.setPhone(request.getPhone());
        business.setAddress(request.getAddress());
        business.setDescription(request.getDescription());
        business.setSoloOperator(soloOperator);
        business.setSlug(generateSlug(request.getName()));

        business = businessRepository.save(business);

        BusinessSettings settings = new BusinessSettings();
        settings.setBusiness(business);
        settings.setCancellationCutoffHours(24);
        settings.setSlotIntervalMinutes(15);
        businessSettingsRepository.save(settings);

        if (soloOperator) {
            StaffMember ownerAsStaff = new StaffMember();
            ownerAsStaff.setBusiness(business);
            ownerAsStaff.setAccount(owner);
            ownerAsStaff.setName(owner.getEmail());
            ownerAsStaff.setWorkStart(LocalTime.of(9, 0));
            ownerAsStaff.setWorkEnd(LocalTime.of(17, 0));
            staffMemberRepository.save(ownerAsStaff);
        }

        return mapToBusinessResponse(business);
    }

    public BusinessResponseDTO getBusinessByPublicId(UUID publicId) {
        Business business = businessRepository.findByPublicId(publicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + publicId));
        return mapToBusinessResponse(business);
    }

    public Business getBusinessEntityBySlug(String slug) {
        return businessRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with slug: " + slug));
    }

    public List<BusinessResponseDTO> getAllBusinesses() {
        return businessRepository.findAll().stream()
                .map(this::mapToBusinessResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BusinessSettingsResponseDTO updateSettings(UUID businessPublicId, BusinessSettingsRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        BusinessSettings settings = businessSettingsRepository.findByBusinessId(business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found for business"));

        settings.setCancellationCutoffHours(request.getCancellationCutoffHours());
        settings.setSlotIntervalMinutes(request.getSlotIntervalMinutes());

        settings = businessSettingsRepository.save(settings);

        return new BusinessSettingsResponseDTO(
                business.getPublicId(),
                settings.getCancellationCutoffHours(),
                settings.getSlotIntervalMinutes()
        );
    }

    @Transactional
    public BusinessClosureResponseDTO addClosure(UUID businessPublicId, BusinessClosureRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

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

    public List<BusinessClosureResponseDTO> getClosures(UUID businessPublicId) {
        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        return businessClosureRepository.findByBusinessId(business.getId()).stream()
                .map(closure -> new BusinessClosureResponseDTO(
                        closure.getId(),
                        closure.getClosureDate(),
                        closure.getReason()
                ))
                .collect(Collectors.toList());
    }

    private String generateSlug(String businessName) {
        String base = businessName.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");
        if (base.isEmpty()) {
            base = "business";
        }
        String slug = base;
        int counter = 2;
        while (businessRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    BusinessResponseDTO mapToBusinessResponse(Business business) {
        return new BusinessResponseDTO(
                business.getPublicId(),
                business.getSlug(),
                business.getName(),
                business.getCategory(),
                business.getPhone(),
                business.getAddress(),
                business.getDescription(),
                business.getSoloOperator(),
                business.getCreatedAt()
        );
    }
}
