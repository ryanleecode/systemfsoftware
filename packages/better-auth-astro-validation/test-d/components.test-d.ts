import * as components from 'better-auth-astro/components'
import { expectAssignable, expectType } from 'tsd'

// Test that components export is available and properly typed
expectType<object>(components)

// Test that components export has proper structure
expectAssignable<Record<string, any>>(components)
