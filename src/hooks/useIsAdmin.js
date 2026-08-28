import { useAuth } from './useAuth'

/**
 * Hook personalizado para verificar el estado de administrador
 * @returns {boolean} - true si el usuario es admin, false en caso contrario
 */
export const useIsAdmin = () => {
  const { session } = useAuth()

  return Boolean(session?.user)
}
