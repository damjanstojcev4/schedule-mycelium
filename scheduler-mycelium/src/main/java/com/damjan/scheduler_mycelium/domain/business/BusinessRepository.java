package com.damjan.scheduler_mycelium.domain.business;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    List<Business> findByOwnerId(Long ownerId);

    boolean existsByIdAndOwnerId(Long businessId, Long ownerId);

    Optional<Business> findByPublicId(UUID publicId);

    Optional<Business> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
