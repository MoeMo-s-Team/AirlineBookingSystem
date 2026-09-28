package com.airline.config;

import org.junit.jupiter.api.Test;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DevProfileConfigurationTest {

    @Test
    @SuppressWarnings("unchecked")
    void testDevProfileHasDdlAutoUpdate() {
        Yaml yaml = new Yaml();
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("application-dev.yml")) {
            assertNotNull(in, "application-dev.yml should exist");
            Map<String, Object> data = yaml.load(in);
            Map<String, Object> spring = (Map<String, Object>) data.get("spring");
            assertNotNull(spring, "spring section should exist");
            Map<String, Object> jpa = (Map<String, Object>) spring.get("jpa");
            assertNotNull(jpa, "jpa section should exist");
            Map<String, Object> hibernate = (Map<String, Object>) jpa.get("hibernate");
            assertNotNull(hibernate, "hibernate section should exist");
            assertEquals("update", hibernate.get("ddl-auto"));
        } catch (Exception e) {
            fail("Failed to parse application-dev.yml: " + e.getMessage());
        }
    }
}
