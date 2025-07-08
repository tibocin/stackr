/**
 * Tests for the greet function
 * 
 * This file demonstrates TDD principles by testing the greet function
 * before implementation, including edge cases and expected behavior.
 */

import { greet } from '../../src/utils/greet';

describe('greet', () => {
  test('should return greeting with provided name', () => {
    const result = greet('Alice');
    expect(result).toBe('Hello, Alice!');
  });

  test('should handle empty string by using default', () => {
    const result = greet('');
    expect(result).toBe('Hello, World!');
  });

  test('should handle null by using default', () => {
    const result = greet(null as any);
    expect(result).toBe('Hello, World!');
  });

  test('should handle undefined by using default', () => {
    const result = greet(undefined as any);
    expect(result).toBe('Hello, World!');
  });

  test('should handle whitespace-only string by using default', () => {
    const result = greet('   ');
    expect(result).toBe('Hello, World!');
  });

  test('should handle special characters in name', () => {
    const result = greet('John-Doe');
    expect(result).toBe('Hello, John-Doe!');
  });
}); 