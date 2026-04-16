package com.riddlerush.game;

import static org.junit.Assert.*;

import java.io.File;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.IOException;

import org.junit.Test;
import org.junit.Assume;

/**
 * Tests that the Capacitor configuration JSON (synced into Android assets)
 * contains the expected values. These run as JVM unit tests by reading the
 * file from the project tree directly.
 *
 * Skipped gracefully if the config file doesn't exist (pre-sync).
 */
public class CapacitorConfigTest {

    private static final String CONFIG_PATH =
        "src/main/assets/capacitor.config.json";

    private String readConfigFile() {
        File f = new File(CONFIG_PATH);
        if (!f.exists()) {
            // Try from app/ working directory (Gradle test runner CWD varies)
            f = new File("app/" + CONFIG_PATH);
        }
        Assume.assumeTrue("capacitor.config.json not found (run cap sync first)", f.exists());

        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException e) {
            fail("Failed to read capacitor.config.json: " + e.getMessage());
        }
        return sb.toString();
    }

    @Test
    public void config_hasCorrectAppId() {
        String json = readConfigFile();
        assertTrue("Config must contain appId 'com.riddlerush.game'",
            json.contains("\"appId\":\"com.riddlerush.game\"") ||
            json.contains("\"appId\": \"com.riddlerush.game\""));
    }

    @Test
    public void config_hasCorrectAppName() {
        String json = readConfigFile();
        assertTrue("Config must contain appName 'Riddle Rush'",
            json.contains("\"appName\":\"Riddle Rush\"") ||
            json.contains("\"appName\": \"Riddle Rush\""));
    }

    @Test
    public void config_usesHttpsScheme() {
        String json = readConfigFile();
        assertTrue("Android scheme must be https",
            json.contains("\"androidScheme\":\"https\"") ||
            json.contains("\"androidScheme\": \"https\""));
    }

    @Test
    public void config_disallowsMixedContent() {
        String json = readConfigFile();
        assertTrue("allowMixedContent must be false",
            json.contains("\"allowMixedContent\":false") ||
            json.contains("\"allowMixedContent\": false"));
    }

    @Test
    public void config_hasSplashScreenPlugin() {
        String json = readConfigFile();
        assertTrue("SplashScreen plugin must be configured",
            json.contains("\"SplashScreen\""));
    }

    @Test
    public void config_hasStatusBarPlugin() {
        String json = readConfigFile();
        assertTrue("StatusBar plugin must be configured",
            json.contains("\"StatusBar\""));
    }

    @Test
    public void config_hasKeyboardPlugin() {
        String json = readConfigFile();
        assertTrue("Keyboard plugin must be configured",
            json.contains("\"Keyboard\""));
    }

    @Test
    public void config_brandColor() {
        String json = readConfigFile();
        assertTrue("backgroundColor must be brand orange #ff6b35",
            json.contains("\"backgroundColor\":\"#ff6b35\"") ||
            json.contains("\"backgroundColor\": \"#ff6b35\""));
    }
}
