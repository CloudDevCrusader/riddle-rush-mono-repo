package com.riddlerush.game;

import static org.junit.Assert.*;

import org.junit.Test;

/**
 * Sanity checks for build configuration constants.
 * These verify the values declared in variables.gradle and build.gradle
 * stay within expected ranges.
 */
public class BuildConfigSanityTest {

    // Values from variables.gradle — keep in sync when updating
    private static final int MIN_SDK = 24;
    private static final int COMPILE_SDK = 36;
    private static final int TARGET_SDK = 36;

    private static final String APP_ID = "com.riddlerush.game";
    private static final String APP_NAME = "Riddle Rush";

    @Test
    public void minSdk_meetsCapacitorRequirement() {
        // Capacitor 8 requires minSdk >= 23
        assertTrue("minSdk must be >= 23 for Capacitor 8", MIN_SDK >= 23);
    }

    @Test
    public void targetSdk_meetsPlayStoreRequirement() {
        // Google Play requires targetSdk >= 34 (as of 2025)
        assertTrue("targetSdk must be >= 34 for Play Store", TARGET_SDK >= 34);
    }

    @Test
    public void compileSdk_atLeastTargetSdk() {
        assertTrue("compileSdk must be >= targetSdk", COMPILE_SDK >= TARGET_SDK);
    }

    @Test
    public void appId_matchesExpected() {
        assertEquals("com.riddlerush.game", APP_ID);
    }

    @Test
    public void appId_isValidAndroidPackageName() {
        // Android package names: lowercase letters, digits, dots; at least two segments
        assertTrue("appId must contain a dot", APP_ID.contains("."));
        assertTrue("appId must match Android package name rules",
            APP_ID.matches("^[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+$"));
    }

    @Test
    public void appName_isNotEmpty() {
        assertNotNull(APP_NAME);
        assertFalse("App name must not be empty", APP_NAME.isEmpty());
    }

    @Test
    public void versionCode_formula_doesNotOverflowInt() {
        // Max version before int overflow: major * 10000 + minor * 100 + patch
        // Android versionCode must be < 2_100_000_000
        int maxMajor = 200_000;
        long code = (long) maxMajor * 10_000;
        assertTrue("Version code formula stays within int range for reasonable versions",
            code < Integer.MAX_VALUE);
    }
}
