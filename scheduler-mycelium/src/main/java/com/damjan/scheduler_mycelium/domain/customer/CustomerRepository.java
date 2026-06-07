package com.damjan.scheduler_mycelium.domain.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByAccountId(Long accountId);

    boolean existsByAccountId(Long accountId);

    Optional<Customer> findByPublicId(UUID publicId);
}
