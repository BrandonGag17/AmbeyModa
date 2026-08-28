import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAuth } from './hooks/useAuth'
import "./Cuenta.css";

function Cuenta() {
    const navigate = useNavigate()
    const { session, cargando } = useAuth()
    const [email, setEmail] = useState('')
    const [contrasena, setContrasena] = useState('')
    const [procesando, setProcesando] = useState(false)

    async function iniciarSesion(e) {
        e.preventDefault()
        setProcesando(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: contrasena
        })

        if (error) {
            alert('No se pudo iniciar sesión. Revisá tu email y contraseña.')
        }

        setProcesando(false)
    }

    async function cerrarSesion() {
        await supabase.auth.signOut()
        navigate('/')
    }

    return (
        <div className="cuenta-page">
            <div className="cuenta-card">

                <p>Panel de administración</p>

                {cargando ? <p>Verificando sesión...</p> : session ? (
                    <>
                        <p className="admin-ok">Sesión iniciada</p>
                        <button type="button" onClick={cerrarSesion}>
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <form onSubmit={iniciarSesion}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            autoComplete="current-password"
                            required
                        />

                        <button type="submit" disabled={procesando}>
                            {procesando ? 'Ingresando...' : 'Iniciar sesión'}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}

export default Cuenta;