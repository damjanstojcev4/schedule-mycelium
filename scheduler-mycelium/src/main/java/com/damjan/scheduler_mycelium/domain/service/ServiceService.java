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
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final BusinessRepository businessRepository;
    private final TenantGuard tenantGuard;

    @Transactional
    public ServiceResponseDTO createService(Long businessId, CreateServiceRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new BusinessNotFoundException("Business not found with id: " + businessId));

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

    public List<ServiceResponseDTO> getActiveServices(Long businessId) {
        return serviceRepository.findByBusinessId(businessId).stream()
                .filter(Service::getIsActive)
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceResponseDTO updateService(Long businessId, Long serviceId, UpdateServiceRequestDTO request, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        if (!service.getBusiness().getId().equals(businessId)) {
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
    public void deactivateService(Long businessId, Long serviceId, Authentication auth) {
        tenantGuard.assertOwner(businessId, auth);

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        if (!service.getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("Service does not belong to this business");
        }

        service.setIsActive(false);
        serviceRepository.save(service);
    }

    private ServiceResponseDTO mapToServiceResponse(Service service) {
        return new ServiceResponseDTO(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getPrice(),
                service.getIsActive(),
                service.getCreatedAt()
        );
    }
}
