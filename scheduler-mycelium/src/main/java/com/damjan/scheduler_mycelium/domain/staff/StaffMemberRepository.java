package com.damjan.scheduler_mycelium.domain.staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {
    List<StaffMember> findByBusinessId(Long businessId);

    Optional<StaffMember> findByAccountId(Long accountId);

    List<StaffMember> findByBusinessIdOrderByName(Long businessId);

    Optional<StaffMember> findByPublicId(UUID publicId);

    Optional<StaffMember> findByBusinessIdAndAccountId(Long businessId, Long accountId);
}
