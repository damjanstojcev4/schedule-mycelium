package com.damjan.scheduler_mycelium.domain.business;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    Optional<Business> findById(Long id);

    List<Business> findByOwnerId(Long ownerId);

    boolean existsByIdAndOwnerId(Long businessId, Long ownerId);
}
