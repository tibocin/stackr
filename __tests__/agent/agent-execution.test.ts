/**
 * Tests for Agent execution loop and traversal
 * 
 * This file tests the agent's ability to traverse through the graph:
 * - step() method for advancing one node at a time
 * - runAll() method for completing the entire workflow
 * - Path tracking and completion detection
 */

import { Agent } from '../../src/agent/Agent';
import { Graph } from '../../src/agent/Graph';
import { Node } from '../../src/agent/Node';

describe('Agent Execution', () => {
  describe('step() method', () => {
    test('should advance to next node when available', () => {
      // Arrange: Create a simple A -> B -> C graph
      const nodeA = new Node('A');
      const nodeB = new Node('B');
      const nodeC = new Node('C');
      
      nodeA.addNextNode(nodeB);
      nodeB.addNextNode(nodeC);
      
      const graph = new Graph(nodeA, [nodeB, nodeC]);
      const agent = new Agent(graph);
      
      // Act: Step through the graph
      agent.step();
      
      // Assert: Should be at node B
      expect(agent.getCurrentNodeId()).toBe('B');
      expect(agent.getVisitedPath()).toEqual(['A', 'B']);
    });

    test('should not advance when no next nodes available', () => {
      // Arrange: Create a single node (end of graph)
      const nodeA = new Node('A');
      const graph = new Graph(nodeA);
      const agent = new Agent(graph);
      
      // Act: Try to step when no next nodes
      agent.step();
      
      // Assert: Should remain at node A
      expect(agent.getCurrentNodeId()).toBe('A');
      expect(agent.getVisitedPath()).toEqual(['A']);
    });

    test('should record visits when stepping', () => {
      // Arrange
      const nodeA = new Node('A');
      const nodeB = new Node('B');
      nodeA.addNextNode(nodeB);
      
      const graph = new Graph(nodeA, [nodeB]);
      const agent = new Agent(graph);
      
      // Act
      agent.step();
      
      // Assert: Both nodes should be visited
      expect(agent.getVisitedCount()).toBe(2);
      expect(agent.hasVisited('A')).toBe(true);
      expect(agent.hasVisited('B')).toBe(true);
    });
  });

  describe('runAll() method', () => {
    test('should traverse entire graph from start to end', () => {
      // Arrange: Create A -> B -> C -> D graph
      const nodeA = new Node('A');
      const nodeB = new Node('B');
      const nodeC = new Node('C');
      const nodeD = new Node('D');
      
      nodeA.addNextNode(nodeB);
      nodeB.addNextNode(nodeC);
      nodeC.addNextNode(nodeD);
      
      const graph = new Graph(nodeA, [nodeB, nodeC, nodeD]);
      const agent = new Agent(graph);
      
      // Act
      agent.runAll();
      
      // Assert: Should end at node D with full path recorded
      expect(agent.getCurrentNodeId()).toBe('D');
      expect(agent.getVisitedPath()).toEqual(['A', 'B', 'C', 'D']);
      expect(agent.getVisitedCount()).toBe(4);
    });

    test('should handle single node graph', () => {
      // Arrange
      const nodeA = new Node('A');
      const graph = new Graph(nodeA);
      const agent = new Agent(graph);
      
      // Act
      agent.runAll();
      
      // Assert
      expect(agent.getCurrentNodeId()).toBe('A');
      expect(agent.getVisitedPath()).toEqual(['A']);
      expect(agent.getVisitedCount()).toBe(1);
    });

    test('should handle branching graph (takes first path)', () => {
      // Arrange: Create A -> B and A -> C (branching)
      const nodeA = new Node('A');
      const nodeB = new Node('B');
      const nodeC = new Node('C');
      
      nodeA.addNextNode(nodeB);
      nodeA.addNextNode(nodeC); // Second path (won't be taken)
      
      const graph = new Graph(nodeA, [nodeB, nodeC]);
      const agent = new Agent(graph);
      
      // Act
      agent.runAll();
      
      // Assert: Should take first path (B)
      expect(agent.getCurrentNodeId()).toBe('B');
      expect(agent.getVisitedPath()).toEqual(['A', 'B']);
      expect(agent.hasVisited('C')).toBe(false);
    });
  });

  describe('completion detection', () => {
    test('should detect when agent has completed the graph', () => {
      // Arrange
      const nodeA = new Node('A');
      const nodeB = new Node('B');
      nodeA.addNextNode(nodeB);
      
      const graph = new Graph(nodeA, [nodeB]);
      const agent = new Agent(graph);
      
      // Act
      agent.runAll();
      
      // Assert
      expect(agent.isCompleted()).toBe(true);
    });

    test('should not be completed when at start node', () => {
      // Arrange
      const nodeA = new Node('A');
      const nodeB = new Node('B');
      nodeA.addNextNode(nodeB);
      
      const graph = new Graph(nodeA, [nodeB]);
      const agent = new Agent(graph);
      
      // Assert: Not completed initially
      expect(agent.isCompleted()).toBe(false);
    });
  });
}); 