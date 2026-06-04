package com.damjan.scheduler_mycelium.domain.business;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BusinessClosureRepository extends JpaRepository<BusinessClosure, Long> {
    List<BusinessClosure> findByBusinessId(Long businessId);

    boolean existsByBusinessIdAndClosureDate(Long businessId, LocalDate closureDate);
}
