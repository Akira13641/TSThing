/**
 * Unified Test Runner
 * @fileoverview Runs all test suites and provides comprehensive test reporting
 */

import { setupDOMMock, cleanupDOMMock } from './dom-mock';

// Set up global DOM mocking for all test suites
setupDOMMock();

import { engineTestRunner } from './engine.test';
import { utilTestRunner } from './utils.test';
import { saveSystemTestRunner } from './save-system.test';
import { cameraSystemTestRunner } from './camera-system.test';
import { interactionSystemTestRunner } from './interaction-system.test';
import { accessibilitySystemTestRunner } from './accessibility-system.test';
import { debugToolsSystemTestRunner } from './debug-tools-system.test';
import { componentTestRunner } from './component.test.tsx';
import { integrationTestRunner } from './integration.test';
import { performanceTestRunner } from './performance.test';
import { accessibilityTestRunner as accessibilityComplianceTestRunner } from './accessibility.test';

/**
 * Test suite interface
 */
interface TestSuite {
  name: string;
  runner: { run: () => { passed: number; failed: number } };
  category: 'engine' | 'utils' | 'system' | 'component' | 'integration' | 'performance' | 'accessibility';
}

/**
 * Test result interface
 */
interface TestResult {
  suite: string;
  category: string;
  passed: number;
  failed: number;
  duration: number;
  errors: string[];
}

/**
 * Unified test runner
 */
class UnifiedTestRunner {
  private testSuites: TestSuite[] = [];
  private results: TestResult[] = [];
  private startTime: number = 0;

  /**
   * Registers all test suites
   */
  constructor() {
    this.registerTestSuites();
  }

  /**
   * Registers all available test suites
   */
  private registerTestSuites(): void {
    this.testSuites = [
      {
        name: 'Engine Tests',
        category: 'engine',
        runner: engineTestRunner
      },
      {
        name: 'Utility Tests',
        category: 'utils',
        runner: utilTestRunner
      },
      {
        name: 'Save System Tests',
        category: 'system',
        runner: saveSystemTestRunner
      },
      {
        name: 'Camera System Tests',
        category: 'system',
        runner: cameraSystemTestRunner
      },
      {
        name: 'Interaction System Tests',
        category: 'system',
        runner: interactionSystemTestRunner
      },
      {
        name: 'Accessibility System Tests',
        category: 'system',
        runner: accessibilitySystemTestRunner
      },
      {
        name: 'Debug Tools System Tests',
        category: 'system',
        runner: debugToolsSystemTestRunner
      },
      {
        name: 'Component Tests',
        category: 'component',
        runner: componentTestRunner
      },
      {
        name: 'Integration Tests',
        category: 'integration',
        runner: integrationTestRunner
      },
      {
        name: 'Performance Tests',
        category: 'performance',
        runner: performanceTestRunner
      },
      {
        name: 'Accessibility Compliance Tests',
        category: 'accessibility',
        runner: accessibilityComplianceTestRunner
      }
    ];
  }

  /**
   * Runs all test suites and generates comprehensive report
   */
  public async runAll(): Promise<void> {
    console.log('🧪 Aetherial Vanguard - Unified Test Runner');
    console.log('==================================================');
    console.log('');
    
    this.startTime = performance.now();
    
    // Run each test suite
    for (const suite of this.testSuites) {
      await this.runTestSuite(suite);
    }
    
    // Generate final report
    this.generateFinalReport();
  }

  /**
   * Runs a single test suite
   * @param suite - Test suite to run
   */
  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`🔧 Running ${suite.name}...`);
    
    const suiteStartTime = performance.now();
    let passed = 0;
    let failed = 0;
    let errors: string[] = [];
    
    try {
      // Run the test suite and get results
      const result = await suite.runner.run();
      passed = result.passed;
      failed = result.failed;
      
    } catch (error) {
      failed++;
      errors.push(`Suite execution error: ${error}`);
    }
    
    const suiteEndTime = performance.now();
    const duration = suiteEndTime - suiteStartTime;
    
    // Store result
    this.results.push({
      suite: suite.name,
      category: suite.category,
      passed,
      failed,
      duration,
      errors
    });
    
    console.log(`✅ ${suite.name} completed in ${duration.toFixed(2)}ms`);
    console.log(`   📊 Results: ${passed} passed, ${failed} failed`);
    if (errors.length > 0) {
      console.log(`   ❌ Errors: ${errors.length}`);
    }
    console.log('');
  }

  /**
   * Generates comprehensive final report
   */
  private generateFinalReport(): void {
    const totalEndTime = performance.now();
    const totalDuration = totalEndTime - this.startTime;
    
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('==================================================');
    console.log('');
    
    // Calculate totals
    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : '0';
    
    // Summary
    console.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log('');
    
    // Results by category
    console.log('📋 Results by Category:');
    console.log('-------------------');
    
    const categories = ['engine', 'utils', 'system', 'component', 'integration', 'performance', 'accessibility'];
    
    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const categoryPassed = categoryResults.reduce((sum, r) => sum + r.passed, 0);
      const categoryFailed = categoryResults.reduce((sum, r) => sum + r.failed, 0);
      const categoryTotal = categoryPassed + categoryFailed;
      const categorySuccessRate = categoryTotal > 0 ? (categoryPassed / categoryTotal * 100).toFixed(1) : '0';
      
      console.log(`${this.getCategoryName(category)}: ${categoryTotal} tests (${categoryPassed} passed, ${categoryFailed} failed) - ${categorySuccessRate}%`);
    });
    
    console.log('');
    
    // Individual suite results
    console.log('📋 Individual Suite Results:');
    console.log('-----------------------------');
    
    this.results.forEach(result => {
      const status = result.failed === 0 ? '✅' : '❌';
      const rate = (result.passed + result.failed) > 0 ? 
        (result.passed / (result.passed + result.failed) * 100).toFixed(1) : '0';
      
      console.log(`${status} ${result.suite}: ${result.passed + result.failed} tests (${rate}%) - ${result.duration.toFixed(2)}ms`);
      
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.slice(0, 3).join(', ')}`);
      }
    });
    
    console.log('');
    
    // Performance analysis
    console.log('⚡ Performance Analysis:');
    console.log('---------------------');
    
    const performanceResults = this.results.filter(r => r.category === 'performance');
    const systemResults = this.results.filter(r => r.category === 'system');
    
    if (performanceResults.length > 0) {
      const avgPerfDuration = performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length;
      console.log(`Average performance test duration: ${avgPerfDuration.toFixed(2)}ms`);
      
      const slowestPerfTest = performanceResults.reduce((slowest, r) => r.duration > slowest.duration ? r : slowest);
      console.log(`Slowest performance test: ${slowestPerfTest.suite} (${slowestPerfTest.duration.toFixed(2)}ms)`);
    }
    
    if (systemResults.length > 0) {
      const avgSystemDuration = systemResults.reduce((sum, r) => sum + r.duration, 0) / systemResults.length;
      console.log(`Average system test duration: ${avgSystemDuration.toFixed(2)}ms`);
    }
    
    console.log('');
    
    // Recommendations
    console.log('💡 Recommendations:');
    console.log('-----------------');
    
    if (totalFailed > 0) {
      console.log('❌ Some tests failed - review failing tests and fix issues');
    }
    
    if (totalTests > 0 && successRate < 95) {
      console.log('⚠️  Success rate below 95% - review test coverage and implementation');
    }
    
    const slowTests = this.results.filter(r => r.duration > 1000);
    if (slowTests.length > 0) {
      console.log('⚠️  Some tests took >1s - consider optimizing test performance');
    }
    
    const failedAccessibility = this.results.filter(r => r.category === 'accessibility' && r.failed > 0);
    if (failedAccessibility.length > 0) {
      console.log('♿  Accessibility tests failed - review accessibility implementation');
    }
    
    if (totalTests > 0 && successRate >= 95) {
      console.log('✅ Excellent test coverage and success rate!');
    }
    
    console.log('');
    console.log('🎯 Test execution completed!');
    console.log('==================================================');
  }

  /**
   * Gets user-friendly category name
   * @param category - Category identifier
   * @returns User-friendly name
   */
  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      'engine': 'Core Engine',
      'utils': 'Utilities',
      'system': 'Game Systems',
      'component': 'UI Components',
      'integration': 'Integration',
      'performance': 'Performance',
      'accessibility': 'Accessibility'
    };
    
    return names[category] || category;
  }

  /**
   * Runs a specific test suite
   * @param suiteName - Name of suite to run
   */
  public async runSuite(suiteName: string): Promise<void> {
    const suite = this.testSuites.find(s => s.name.toLowerCase().includes(suiteName.toLowerCase()));
    
    if (suite) {
      console.log(`🎯 Running single test suite: ${suite.name}`);
      console.log('==================================================');
      console.log('');
      
      await this.runTestSuite(suite);
      
      console.log('');
      console.log('🎯 Single test suite completed!');
      console.log('==================================================');
    } else {
      console.log(`❌ Test suite "${suiteName}" not found`);
      console.log('Available suites:');
      this.testSuites.forEach(s => console.log(`  - ${s.name}`));
    }
  }

  /**
   * Lists all available test suites
   */
  public listSuites(): void {
    console.log('📋 Available Test Suites:');
    console.log('======================');
    
    this.testSuites.forEach(suite => {
      console.log(`  - ${suite.name} (${suite.category})`);
    });
    
    console.log('');
    console.log('Usage: node run_tests.js [suite-name]');
    console.log('Or run all tests: node run_tests.js');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const runner = new UnifiedTestRunner();

async function main() {
  if (args.length === 0) {
    // Run all tests
    await runner.runAll();
  } else {
    // Run specific suite
    const suiteName = args[0];
    await runner.runSuite(suiteName);
  }
}

main().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});

export { UnifiedTestRunner };