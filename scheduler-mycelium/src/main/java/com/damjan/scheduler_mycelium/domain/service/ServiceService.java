package com.damjan.scheduler_mycelium.domain.service;

import com.damjan.scheduler_mycelium.domain.business.Business;
import com.damjan.scheduler_mycelium.domain.business.BusinessRepository;
import com.damjan.scheduler_mycelium.domain.service.dto.*;
import com.damjan.scheduler_mycelium.exception.BusinessNotFoundException;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import com.damjan.scheduler_mycelium.security.TenantGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final BusinessRepository businessRepository;
    private final TenantGuard tenantGuard;

    @Transactional
    public ServiceResponseDTO createService(UUID businessPublicId, CreateServiceRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        Service service = new Service();
        service.setBusiness(business);
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setPrice(request.getPrice());
        service.setIsActive(true);

        service = serviceRepository.save(service);

        return mapToServiceResponse(service);
    }

    public List<ServiceResponseDTO> getActiveServices(UUID businessPublicId) {
        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        return serviceRepository.findByBusinessId(business.getId()).stream()
                .filter(Service::getIsActive)
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    public List<ServiceResponseDTO> getAllServices(UUID businessPublicId, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        return serviceRepository.findByBusinessId(business.getId()).stream()
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceResponseDTO updateService(UUID businessPublicId, UUID servicePublicId, UpdateServiceRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        Service service = serviceRepository.findByPublicId(servicePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with publicId: " + servicePublicId));

        if (!service.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Service does not belong to this business");
        }

        if (request.getName() != null) service.setName(request.getName());
        if (request.getDescription() != null) service.setDescription(request.getDescription());
        if (request.getDurationMinutes() != null) service.setDurationMinutes(request.getDurationMinutes());
        if (request.getPrice() != null) service.setPrice(request.getPrice());

        service = serviceRepository.save(service);

        return mapToServiceResponse(service);
    }

    @Transactional
    public void deactivateService(UUID businessPublicId, UUID servicePublicId, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        Service service = serviceRepository.findByPublicId(servicePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with publicId: " + servicePublicId));

        if (!service.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Service does not belong to this business");
        }

        service.setIsActive(false);
        serviceRepository.save(service);
    }

    @Transactional
    public void activateService(UUID businessPublicId, UUID servicePublicId, Authentication auth) {
        tenantGuard.assertOwner(businessPublicId, auth);

        Business business = businessRepository.findByPublicId(businessPublicId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with publicId: " + businessPublicId));

        Service service = serviceRepository.findByPublicId(servicePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with publicId: " + servicePublicId));

        if (!service.getBusiness().getId().equals(business.getId())) {
            throw new IllegalArgumentException("Service does not belong to this business");
        }

        service.setIsActive(true);
        serviceRepository.save(service);
    }

    public ServiceResponseDTO mapToServiceResponse(Service service) {
        return new ServiceResponseDTO(
                service.getPublicId(),
                service.getName(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getPrice(),
                service.getIsActive(),
                service.getCreatedAt()
        );
    }
}
