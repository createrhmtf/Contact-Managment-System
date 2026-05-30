package com.cms.integration;

import com.cms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Application Context Integration Tests")
class ApplicationContextIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    @DisplayName("TC-SYS-01: Spring context loads with test profile")
    void contextLoads() {
        assertThat(applicationContext).isNotNull();
        assertThat(applicationContext.getBean("authController")).isNotNull();
        assertThat(applicationContext.getBean("authServiceImpl")).isNotNull();
    }
}
