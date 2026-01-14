import { vi } from 'vitest'
import { webcrypto } from 'node:crypto'

// Mock the global crypto object to use Node.js webcrypto
vi.stubGlobal('crypto', webcrypto)
