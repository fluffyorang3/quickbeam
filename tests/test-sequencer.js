const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // Sort tests to run unit tests first, then integration tests
    // This helps with memory management and test isolation
    return tests.sort((testA, testB) => {
      const isUnitA = testA.path.includes('/unit/');
      const isUnitB = testB.path.includes('/unit/');
      
      if (isUnitA && !isUnitB) return -1;
      if (!isUnitA && isUnitB) return 1;
      
      // Within same category, sort by filename for consistency
      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = CustomSequencer;
