#!/usr/bin/env python3
"""
Stackr Test Runner

PURPOSE: Run tests with proper Python path setup
RELATED: CI/CD pipeline, pytest integration
TAGS: testing, pytest, ci-cd
"""

import os
import sys
import subprocess

def main():
    """Run tests with proper path setup."""
    # Add the current directory to Python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    
    # Add both current and parent directories to path
    sys.path.insert(0, current_dir)
    sys.path.insert(0, parent_dir)
    
    # Set environment variable for Python path
    os.environ['PYTHONPATH'] = f"{current_dir}:{parent_dir}"
    
    # Install application dependencies from requirements.txt
    requirements_file = os.path.join(parent_dir, 'requirements.txt')
    if os.path.exists(requirements_file):
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', requirements_file], check=True)
    
    # Install additional test dependencies
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'pytest', 'pytest-asyncio', 'pytest-cov'], check=True)
    
    # Run pytest with proper arguments
    test_dir = os.path.join(current_dir, 'tests')
    cmd = [
        sys.executable, '-m', 'pytest',
        test_dir,
        '-v',
        '--tb=short'
    ]
    
    print(f"Running tests with command: {' '.join(cmd)}")
    print(f"Python path: {os.environ['PYTHONPATH']}")
    
    result = subprocess.run(cmd)
    return result.returncode

if __name__ == "__main__":
    exit(main()) 