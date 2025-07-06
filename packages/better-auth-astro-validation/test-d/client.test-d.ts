import * as client from 'better-auth-astro/client'
import { expectAssignable, expectType } from 'tsd'

// Test that client export is available and properly typed
expectType<object>(client)

// Test that client export has proper structure
expectAssignable<Record<string, any>>(client)
