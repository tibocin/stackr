/**
 * Greeting utility function
 * 
 * This function generates a personalized greeting message. It handles
 * various edge cases by providing a default greeting when the input
 * is invalid or empty.
 * 
 * @param name - The name to greet. Can be a string, null, or undefined.
 * @returns A greeting string in the format "Hello, {name}!" or "Hello, World!" for invalid inputs.
 * 
 * @example
 * ```typescript
 * greet('Alice') // Returns: "Hello, Alice!"
 * greet('') // Returns: "Hello, World!"
 * greet(null) // Returns: "Hello, World!"
 * ```
 * 
 * @throws {Error} This function does not throw errors, it handles all edge cases gracefully.
 */
export function greet(name: string | null | undefined): string {
  // Handle edge cases: null, undefined, empty string, or whitespace-only
  if (!name || name.trim() === '') {
    return 'Hello, World!';
  }
  
  // Return personalized greeting with the provided name
  return `Hello, ${name}!`;
} 