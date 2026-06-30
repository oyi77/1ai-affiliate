'use strict';

/**
 * Unit tests for fraudRuleEngine
 * Tests the pure evaluation functions (no DB dependency).
 */

const {
  evaluateBotUA,
  evaluateClickVelocity,
  evaluateClickInterval,
  evaluateTimeToConvert,
  evaluateDatacenterIP,
  evaluateProxyIP,
  BOT_SIGNATURES,
} = require('../../services/fraudRuleEngine');

describe('fraudRuleEngine', () => {

  describe('evaluateBotUA', () => {
    test('detects Googlebot', () => {
      const result = evaluateBotUA('Mozilla/5.0 (compatible; Googlebot/2.1)');
      expect(result.matched).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.reason).toContain('googlebot');
    });

    test('detects headless Chrome', () => {
      const result = evaluateBotUA('Mozilla/5.0 (HeadlessChrome/100.0)');
      expect(result.matched).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });

    test('detects empty UA', () => {
      const result = evaluateBotUA('');
      expect(result.matched).toBe(true);
      expect(result.score).toBe(30);
    });

    test('detects null UA', () => {
      const result = evaluateBotUA(null);
      expect(result.matched).toBe(true);
    });

    test('passes normal browser UA', () => {
      const result = evaluateBotUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      expect(result.matched).toBe(false);
      expect(result.score).toBe(0);
    });

    test('detects curl', () => {
      const result = evaluateBotUA('curl/7.68.0');
      expect(result.matched).toBe(true);
      expect(result.reason).toContain('curl');
    });

    test('detects python-requests', () => {
      const result = evaluateBotUA('python-requests/2.28.0');
      expect(result.matched).toBe(true);
    });
  });

  describe('evaluateClickVelocity', () => {
    test('passes low velocity', () => {
      const result = evaluateClickVelocity(5);
      expect(result.matched).toBe(false);
    });

    test('flags high velocity', () => {
      const result = evaluateClickVelocity(15);
      expect(result.matched).toBe(true);
      expect(result.score).toBe(20);
    });

    test('flags extreme velocity', () => {
      const result = evaluateClickVelocity(60);
      expect(result.matched).toBe(true);
      expect(result.score).toBe(40);
    });
  });

  describe('evaluateClickInterval', () => {
    test('passes normal interval', () => {
      const result = evaluateClickInterval(5000);
      expect(result.matched).toBe(false);
    });

    test('flags rapid interval', () => {
      const result = evaluateClickInterval(200);
      expect(result.matched).toBe(true);
      expect(result.score).toBe(30);
    });
  });

  describe('evaluateTimeToConvert', () => {
    test('passes normal TTC', () => {
      const result = evaluateTimeToConvert(60);
      expect(result.matched).toBe(false);
    });

    test('flags suspicious TTC', () => {
      const result = evaluateTimeToConvert(1.5);
      expect(result.matched).toBe(true);
      expect(result.score).toBe(50);
    });

    test('flags low TTC', () => {
      const result = evaluateTimeToConvert(5);
      expect(result.matched).toBe(true);
      expect(result.score).toBe(20);
    });
  });

  describe('evaluateDatacenterIP', () => {
    test('flags datacenter', () => {
      const result = evaluateDatacenterIP(true);
      expect(result.matched).toBe(true);
      expect(result.score).toBe(30);
    });

    test('passes residential', () => {
      const result = evaluateDatacenterIP(false);
      expect(result.matched).toBe(false);
    });
  });

  describe('evaluateProxyIP', () => {
    test('flags proxy', () => {
      const result = evaluateProxyIP(true);
      expect(result.matched).toBe(true);
      expect(result.score).toBe(40);
    });

    test('passes direct', () => {
      const result = evaluateProxyIP(false);
      expect(result.matched).toBe(false);
    });
  });

  describe('BOT_SIGNATURES', () => {
    test('has at least 80 signatures', () => {
      expect(BOT_SIGNATURES.length).toBeGreaterThanOrEqual(80);
    });

    test('includes common bots', () => {
      expect(BOT_SIGNATURES).toContain('googlebot');
      expect(BOT_SIGNATURES).toContain('curl');
      expect(BOT_SIGNATURES).toContain('selenium');
      expect(BOT_SIGNATURES).toContain('puppeteer');
    });
  });
});
