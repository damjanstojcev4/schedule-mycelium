package com.damjan.scheduler_mycelium.domain.account;

import com.damjan.scheduler_mycelium.domain.account.dto.AuthResponseDTO;
import com.damjan.scheduler_mycelium.domain.account.dto.LoginRequestDTO;
import com.damjan.scheduler_mycelium.domain.account.dto.RegisterRequestDTO;
import com.damjan.scheduler_mycelium.domain.customer.Customer;
import com.damjan.scheduler_mycelium.domain.customer.CustomerRepository;
import com.damjan.scheduler_mycelium.exception.UnauthorizedException;
import com.damjan.scheduler_mycelium.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already taken");
        }

        Account account = new Account();
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setRole(Account.Role.valueOf(request.getRole()));

        account = accountRepository.save(account);

        if (account.getRole() == Account.Role.CUSTOMER) {
            Customer customer = new Customer();
            customer.setAccount(account);
            // Default full name, can be updated later by the customer
            customer.setFullName(request.getEmail().split("@")[0]); 
            customerRepository.save(customer);
        }

        String token = jwtUtil.generateToken(account);

        return new AuthResponseDTO(
                token,
                account.getId(),
                account.getEmail(),
                account.getRole().name()
        );
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(account);

        return new AuthResponseDTO(
                token,
                account.getId(),
                account.getEmail(),
                account.getRole().name()
        );
    }
}
