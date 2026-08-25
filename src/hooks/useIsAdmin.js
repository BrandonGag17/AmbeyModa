import { useEffect, useState } from 'react'

/**
 * Hook personalizado para verificar el estado de administrador
 * @returns {boolean} - true si el usuario es admin, false en caso contrario
 */
export const useIsAdmin = () => {
  const [esAdmin, setEsAdmin] = useState(false)

  useEffect(() => {
    const adminGuardado = localStorage.getItem('esAdmin')
    setEsAdmin(adminGuardado === 'true')
  }, [])

  return esAdmin
}
