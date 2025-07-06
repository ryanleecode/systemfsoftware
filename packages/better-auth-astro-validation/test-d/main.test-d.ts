import * as main from 'better-auth-astro'
import { expectAssignable, expectType } from 'tsd'

// Test that main export is available and properly typed
expectType<object>(main)

// Test that main export has proper structure
expectAssignable<Record<string, any>>(main)
