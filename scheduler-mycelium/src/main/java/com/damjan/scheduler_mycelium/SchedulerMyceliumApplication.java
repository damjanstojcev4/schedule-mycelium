package com.damjan.scheduler_mycelium;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class SchedulerMyceliumApplication {

	public static void main(String[] args) {
		// Triggering production deployment trigger
		SpringApplication.run(SchedulerMyceliumApplication.class, args);
	}

}
