package com.canchapp.CanchAPP_Back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CanchAppBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(CanchAppBackApplication.class, args);
	}

}
