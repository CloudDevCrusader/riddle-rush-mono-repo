package com.riddlerush.game;

import static org.junit.Assert.*;

import org.junit.Test;

/**
 * Tests version code derivation logic used in build.gradle.
 * The Gradle script reads the monorepo root package.json and computes:
 *   versionCode = major * 10_000 + minor * 100 + patch
 *
 * These tests verify that formula against known inputs.
 */
public class VersionCodeTest {

    /**
     * Mirror of the Gradle readRootPackageVersion formula.
     */
    private static int computeVersionCode(String semver) {
        String core = semver.replaceAll("[^0-9.].*$", "");
        String[] parts = core.split("\\.");
        int major = parts.length > 0 ? Integer.parseInt(parts[0]) : 0;
        int minor = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        int patch = parts.length > 2 ? Integer.parseInt(parts[2]) : 0;
        return major * 10_000 + minor * 100 + patch;
    }

    @Test
    public void versionCode_1_5_0() {
        assertEquals(10500, computeVersionCode("1.5.0"));
    }

    @Test
    public void versionCode_1_0_0() {
        assertEquals(10000, computeVersionCode("1.0.0"));
    }

    @Test
    public void versionCode_2_10_3() {
        assertEquals(21003, computeVersionCode("2.10.3"));
    }

    @Test
    public void versionCode_0_1_0() {
        assertEquals(100, computeVersionCode("0.1.0"));
    }

    @Test
    public void versionCode_0_0_1() {
        assertEquals(1, computeVersionCode("0.0.1"));
    }

    @Test
    public void versionCode_major_only() {
        assertEquals(30000, computeVersionCode("3"));
    }

    @Test
    public void versionCode_major_minor_only() {
        assertEquals(20500, computeVersionCode("2.5"));
    }

    @Test
    public void versionCode_strips_prerelease_suffix() {
        assertEquals(10500, computeVersionCode("1.5.0-beta.1"));
    }

    @Test
    public void versionCode_strips_build_metadata() {
        assertEquals(10500, computeVersionCode("1.5.0+build.42"));
    }

    @Test
    public void versionName_extracts_core() {
        String raw = "1.5.0-beta.1";
        String core = raw.replaceAll("[^0-9.].*$", "");
        assertEquals("1.5.0", core);
    }
}
