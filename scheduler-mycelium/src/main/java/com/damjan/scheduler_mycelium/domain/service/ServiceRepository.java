package com.damjan.scheduler_mycelium.domain.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByBusinessId(Long businessId);

    List<Service> findByBusinessIdAndIsActiveTrue(Long businessId);

    Optional<Service> findByIdAndBusinessId(Long id, Long businessId);
}
