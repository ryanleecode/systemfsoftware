import * as config from 'better-auth-astro/config'
import { expectAssignable, expectType } from 'tsd'

// Test that config export is available and properly typed
expectType<object>(config)

// Test that config export has proper structure
expectAssignable<Record<string, any>>(config)
