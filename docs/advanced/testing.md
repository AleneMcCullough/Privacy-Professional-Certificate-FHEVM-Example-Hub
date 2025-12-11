# Testing FHEVM Contracts

## Overview

Comprehensive testing ensures contracts work correctly with encrypted data.

## Test Structure

### Setup Phase

```typescript
beforeEach(async function () {
  const Factory = await ethers.getContractFactory("ContractName");
  contract = await Factory.deploy();
  [owner, user] = await ethers.getSigners();
});
```

### Test Categories

1. **Deployment Tests**: Contract deploys correctly
2. **Function Tests**: Core functions work as expected
3. **Authorization Tests**: Access control enforces rules
4. **Event Tests**: Events emitted correctly
5. **Edge Cases**: Boundary conditions handled

## Writing Tests

### Basic Test

```typescript
it("Should perform operation", async function () {
  await contract.functionName(param1, param2);
  const result = await contract.getResult();
  expect(result).to.equal(expectedValue);
});
```

### Authorization Test

```typescript
it("Only owner can perform operation", async function () {
  const nonOwner = user;
  await expect(
    contract.connect(nonOwner).restrictedFunction()
  ).to.be.revertedWith("Only owner");
});
```

### Event Test

```typescript
it("Should emit event on operation", async function () {
  await expect(contract.functionName(param))
    .to.emit(contract, "EventName")
    .withArgs(expectedArg1, expectedArg2);
});
```

## Testing Encrypted Data

### Testing Encrypted Values

```typescript
it("Should store encrypted value", async function () {
  const encryptedValue = 12345n;
  await contract.setEncrypted(encryptedValue);
  
  const stored = await contract.getEncrypted();
  expect(stored).to.equal(encryptedValue);
});
```

### Testing Access Control

```typescript
it("Should only allow authorized decryption", async function () {
  const userScore = await contract.getScore(userAddress);
  expect(userScore).to.exist;
});
```

## Test Organization

### By Contract

```
test/
├── basic/
│   ├── CertificateIssuance.test.ts
│   └── EncryptedScore.test.ts
└── advanced/
    └── ComplexOperations.test.ts
```

### By Functionality

```
test/
├── deployment/
├── operations/
├── authorization/
└── events/
```

## Running Tests

### All Tests

```bash
npm run test
```

### Specific Test File

```bash
npm run test test/examples/CertificateIssuance.test.ts
```

### Specific Test Suite

```bash
npm run test -- --grep "Certificate"
```

### With Coverage

```bash
npm run test -- --coverage
```

## Best Practices

1. **Test One Thing**: Each test should verify one behavior
2. **Clear Names**: Test names explain what is tested
3. **Isolated Tests**: Tests should not depend on each other
4. **Setup/Teardown**: Use beforeEach for consistency
5. **Meaningful Assertions**: Clear expected values

## Common Test Patterns

### Testing Failures

```typescript
it("Should fail on invalid input", async function () {
  await expect(
    contract.function(invalidInput)
  ).to.be.revertedWith("Error message");
});
```

### Testing State Changes

```typescript
it("Should update state correctly", async function () {
  const before = await contract.getValue();
  await contract.setValue(newValue);
  const after = await contract.getValue();
  expect(after).to.equal(newValue);
});
```

### Testing Events with Arguments

```typescript
it("Should emit event with arguments", async function () {
  await expect(contract.execute(arg1, arg2))
    .to.emit(contract, "Executed")
    .withArgs(arg1, arg2, expectedResult);
});
```

## Debugging Tests

### Verbose Output

```bash
npm run test -- --verbose
```

### Specific Gas Reporting

```bash
REPORT_GAS=true npm run test
```

### Adding Logs

```typescript
it("Should process data", async function () {
  console.log("Before:", beforeValue);
  await contract.process(data);
  console.log("After:", afterValue);
});
```

## Test Coverage

Aim for:
- 100% line coverage
- All branches tested
- Edge cases covered
- Error paths verified

Check coverage:

```bash
npm run test -- --coverage
```

## References

- Hardhat Testing Documentation
- Chai Assertion Library
- Ethers.js Testing Guide
