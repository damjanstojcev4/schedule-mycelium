package com.damjan.scheduler_mycelium;

import com.damjan.scheduler_mycelium.domain.account.Account;
import com.damjan.scheduler_mycelium.domain.account.AccountRepository;
import com.damjan.scheduler_mycelium.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SchedulerMyceliumApplicationTests {

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private JwtUtil jwtUtil;

	@Test
	void printToken() {
		Account owner = accountRepository.findByEmail("rakuno@gmail.com")
				.orElseThrow(() -> new AssertionError("rakuno@gmail.com not found"));

		String token = jwtUtil.generateToken(owner);
		System.out.println("=== GENERATED TOKEN FOR RAKUNO ===");
		System.out.println(token);
	}
}
