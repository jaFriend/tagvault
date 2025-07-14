import { mockDeep, mockReset } from 'jest-mock-extended';
import prisma from '../prisma/prisma';

const prismaMock = prisma;

jest.mock('../prisma/prisma.js', () => mockDeep());

beforeEach(() => {
  mockReset(prismaMock);
})

export { prismaMock };
