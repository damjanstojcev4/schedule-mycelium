package com.damjan.scheduler_mycelium.domain.customer;

import com.damjan.scheduler_mycelium.domain.customer.dto.CustomerResponseDTO;
import com.damjan.scheduler_mycelium.domain.customer.dto.UpdateCustomerRequestDTO;
import com.damjan.scheduler_mycelium.exception.ResourceNotFoundException;
import com.damjan.scheduler_mycelium.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerResponseDTO getMyProfile(Authentication auth) {
        Long accountId = ((UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal()).getAccountId();

        Customer customer = customerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        return mapToCustomerResponse(customer);
    }

    @Transactional
    public CustomerResponseDTO updateMyProfile(UpdateCustomerRequestDTO request, Authentication auth) {
        Long accountId = ((UserDetailsServiceImpl.CustomUserDetails) auth.getPrincipal()).getAccountId();

        Customer customer = customerRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        if (request.getFullName() != null) customer.setFullName(request.getFullName());
        if (request.getPhone() != null) customer.setPhone(request.getPhone());

        customer = customerRepository.save(customer);

        return mapToCustomerResponse(customer);
    }

    private CustomerResponseDTO mapToCustomerResponse(Customer customer) {
        return new CustomerResponseDTO(
                customer.getPublicId(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getCreatedAt()
        );
    }
}
