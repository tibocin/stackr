/**
 * Tests for the Agent class
 * 
 * This file tests the core Agent functionality including:
 * - Agent initialization with a Graph
 * - Current node tracking
 * - Basic state management
 */

import { Agent } from '../../src/agent/Agent';
import { Graph } from '../../src/agent/Graph';
import { Node } from '../../src/agent/Node';

describe('Agent', () => {
  describe('initialization', () => {
    test('should initialize with graph and set currentNode to start node', () => {
      // Arrange
      const startNode = new Node('start');
      const graph = new Graph(startNode);
      
      // Act
      const agent = new Agent(graph);
      
      // Assert
      expect(agent.currentNode).toBe(startNode);
      expect(agent.currentNode?.id).toBe('start');
    });

    test('should throw error when graph has no start node', () => {
      // Arrange
      const graph = new Graph(null as any);
      
      // Act & Assert
      expect(() => new Agent(graph)).toThrow('Graph must have a start node');
    });

    test('should initialize with empty visited nodes list', () => {
      // Arrange
      const startNode = new Node('start');
      const graph = new Graph(startNode);
      
      // Act
      const agent = new Agent(graph);
      
      // Assert
      expect(agent.visitedNodes).toEqual([]);
    });
  });

  describe('state management', () => {
    test('should track visited nodes', () => {
      // Arrange
      const startNode = new Node('start');
      const graph = new Graph(startNode);
      const agent = new Agent(graph);
      
      // Act
      agent.recordVisit();
      
      // Assert
      expect(agent.visitedNodes).toHaveLength(1);
      expect(agent.visitedNodes[0]).toBe(startNode);
    });

    test('should not duplicate visited nodes', () => {
      // Arrange
      const startNode = new Node('start');
      const graph = new Graph(startNode);
      const agent = new Agent(graph);
      
      // Act
      agent.recordVisit();
      agent.recordVisit(); // Record same node again
      
      // Assert
      expect(agent.visitedNodes).toHaveLength(1);
      expect(agent.visitedNodes[0]).toBe(startNode);
    });
  });
}); 