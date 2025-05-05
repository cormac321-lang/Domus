import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

dotenv.config();

let mongoServer;

// Connect to the in-memory database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear database between tests
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Disconnect and stop server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Mock Redis client
jest.mock('ioredis', () => {
  const Redis = jest.fn();
  Redis.prototype.get = jest.fn();
  Redis.prototype.setex = jest.fn();
  return Redis;
});

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id' })
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Mock AWS S3
jest.mock('aws-sdk', () => {
  const S3 = jest.fn();
  S3.prototype.upload = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({ Location: 'https://test-url.com' })
  });
  S3.prototype.deleteObject = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({})
  });
  return { S3 };
});

// Global test timeout
jest.setTimeout(30000); 