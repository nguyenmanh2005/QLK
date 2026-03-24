import { useEffect } from 'react'

export function useLoadingCursor(isLoading: boolean) {
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('cursor-loading')
    } else {
      document.body.classList.remove('cursor-loading')
    }
    return () => document.body.classList.remove('cursor-loading')
  }, [isLoading])
}