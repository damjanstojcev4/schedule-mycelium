package com.damjan.scheduler_mycelium.domain.staff;

import com.damjan.scheduler_mycelium.domain.business.Business;
import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.domain.staff.dto.CreateTimeBlockRequestDTO;
import com.damjan.scheduler_mycelium.domain.staff.dto.TimeBlockResponseDTO;
import com.damjan.scheduler_mycelium.exception.BusinessNotFoundException;
import com.damjan.scheduler_mycelium.security.TenantGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffTimeBlockService {

    private final StaffTimeBlockRepository staffTimeBlockRepository;
    private final StaffMemberRepository staffMemberRepository;
    private final BusinessRepository businessRepository;
    private final TenantGuard tenantGuard;

    @Transactional
    public TimeBlockResponseDTO createBlock(UUID businessPublicId, UUID staffPublicId, CreateTimeBlockRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);
        tenantGuard.assertStaffBelongsToBusiness(staffPublicId, businessPublicId, auth);

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (request.getBlockDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Block date cannot be in the past");
        }

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found"));

        StaffMember staffMember = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        StaffTimeBlock block = new StaffTimeBlock();
        block.setBusiness(business);
        block.setStaffMember(staffMember);
        block.setBlockDate(request.getBlockDate());
        block.setStartTime(request.getStartTime());
        block.setEndTime(request.getEndTime());
        block.setReason(request.getReason());

        StaffTimeBlock savedBlock = staffTimeBlockRepository.save(block);

        return mapToDTO(savedBlock);
    }

    @Transactional(readOnly = true)
    public List<TimeBlockResponseDTO> getBlocks(UUID businessPublicId, UUID staffPublicId, LocalDate date, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);
        tenantGuard.assertStaffBelongsToBusiness(staffPublicId, businessPublicId, auth);

        StaffMember staffMember = staffMemberRepository.findByPublicId(staffPublicId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        List<StaffTimeBlock> blocks = staffTimeBlockRepository.findByStaffMemberIdAndBlockDate(staffMember.getId(), date);

        return blocks.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteBlock(UUID businessPublicId, UUID blockPublicId, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        StaffTimeBlock block = staffTimeBlockRepository.findByPublicId(blockPublicId)
                .orElseThrow(() -> new IllegalArgumentException("Time block not found"));

        // Ensure block belongs to business
        if (!block.getBusiness().getPublicId().equals(businessPublicId)) {
            throw new IllegalArgumentException("Time block does not belong to this business");
        }

        staffTimeBlockRepository.delete(block);
    }

    private TimeBlockResponseDTO mapToDTO(StaffTimeBlock block) {
        return TimeBlockResponseDTO.builder()
                .publicId(block.getPublicId().toString())
                .blockDate(block.getBlockDate())
                .startTime(block.getStartTime())
                .endTime(block.getEndTime())
                .reason(block.getReason())
                .createdAt(block.getCreatedAt())
                .build();
    }
}
