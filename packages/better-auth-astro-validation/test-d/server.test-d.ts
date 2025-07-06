import * as server from 'better-auth-astro/server'
import { expectAssignable, expectType } from 'tsd'

// Test that server export is available and properly typed
expectType<object>(server)

// Test that server export has proper structure
expectAssignable<Record<string, any>>(server)
