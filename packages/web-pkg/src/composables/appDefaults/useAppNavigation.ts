import { unref } from '@vue/composition-api'
import { basename } from 'path'
import VueRouter, { Location } from 'vue-router'

import { MaybeRef } from '../../utils'
import { FileContext } from './types'
import { LocationQuery, LocationParams } from '../router'

interface AppNavigationOptions {
  router: VueRouter
  currentFileContext: MaybeRef<FileContext>
}

export interface AppNavigationResult {
  closeApp(): void
}

const contextRouteParamsKey = 'contextRouteParams'
const contextRouteQueryKey = 'contextRouteQuery'

/*
  vue-router type bindings do not allow nested objects
  because they are not handled by default. We override
  parseQuery and stringifyQuery and handle it there.
  That's why we have types that match the router types
  and break them here once on purpose in encapsulated
  functions
*/
export const routeToContextQuery = (location: Location): LocationQuery => {
  const { params, query } = location

  const contextQuery = {}
  const contextQueryItems = ((location as any).meta?.contextQueryItems || []) as string[]
  for (const queryItem of contextQueryItems) {
    contextQuery[queryItem] = query[queryItem]
  }

  return {
    [contextRouteParamsKey]: params,
    [contextRouteQueryKey]: contextQuery
  } as any
}
export const contextQueryToFileContextProps = (
  query: LocationQuery
): { routeParams: LocationParams; routeQuery: LocationQuery } => {
  return {
    routeParams: query[contextRouteParamsKey] as any,
    routeQuery: query[contextRouteQueryKey] as any
  }
}

export function useAppNavigation(options: AppNavigationOptions): AppNavigationResult {
  const navigateToContext = (context: MaybeRef<FileContext>) => {
    const router = options.router

    const { path, routeName, routeParams, routeQuery } = unref(context)

    return router.push({
      name: unref(routeName),
      params: unref(routeParams),
      query: {
        ...unref(routeQuery),
        scrollTo: basename(unref(path))
      }
    })
  }

  const closeApp = () => {
    return navigateToContext(options.currentFileContext)
  }

  return {
    closeApp
  }
}
