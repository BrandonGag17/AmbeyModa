import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

function CrearProducto() {
    const navigate = useNavigate()

    const [Nombre, setNombre] = useState('')
    const [Descripcion, setDescripcion] = useState('')
    const [Precio, setPrecio] = useState('')
    const [Categoria, setCategoria] = useState('')
    const [ImagenUrl, setImagenUrl] = useState('')
    const [ImagenFile, setImagenFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [subiendo, setSubiendo] = useState(false)

    useEffect(() => {
        if (!ImagenFile) {
            setPreviewUrl('')
            return
        }

        const objectUrl = URL.createObjectURL(ImagenFile)
        setPreviewUrl(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [ImagenFile])

    const convertirPrecio = (precio) => {
        if (!precio) return 0
        return Number(precio.toString().replace(',', '.'))
    }

    const convertirArchivoABase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(new Error('Error convirtiendo el archivo a base64'))
            reader.readAsDataURL(file)
        })
    }

    async function agregarProducto(producto) {
        const { error } = await supabase
            .from('Productos')
            .insert([producto])
            .select()

        if (error) {
            alert('Error al crear producto')
            return false
        }

        return true
    }

    const manejarSubmit = async (e) => {
        e.preventDefault()

        if (!Nombre || !Descripcion || !Precio || !Categoria) {
            alert('Completa todos los campos antes de enviar.')
            return
        }

        setSubiendo(true)
        let imagenFinal = ImagenUrl

        if (ImagenFile) {
            try {
                imagenFinal = await convertirArchivoABase64(ImagenFile)
            } catch (error) {
                console.error('Error al convertir la imagen:', error)
                alert('No se pudo procesar la imagen. Intenta con otro archivo.')
                setSubiendo(false)
                return
            }
        }

        if (!imagenFinal) {
            alert('Sube una imagen o pega una URL válida.')
            setSubiendo(false)
            return
        }

        const producto = {
            Nombre,
            Descripcion,
            Precio: convertirPrecio(Precio),
            Categoria,
            ImagenUrl: imagenFinal
        }

        const creado = await agregarProducto(producto)
        setSubiendo(false)

        if (creado) {
            alert('Producto creado ✅')
            navigate('/')
        }
    }

    const manejarArchivo = (e) => {
        const file = e.target.files[0]
        if (!file) return

        setImagenFile(file)
        setImagenUrl('')
    }

    return (
        <form className="form-page" onSubmit={manejarSubmit}>
            <h2>Creando nuevo producto</h2>

            <div className="form-campos">
                <div className="form-campo">
                    <label className="form-label">Nombre</label>
                    <input
                        placeholder="Nombre"
                        value={Nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </div>

                <div className="form-campo">
                    <label className="form-label">Descripción</label>
                    <input
                        placeholder="Descripción"
                        value={Descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>

                <div className="form-campo">
                    <label className="form-label">Precio</label>
                    <input
                        placeholder="0"
                        type="text"
                        value={Precio}
                        onChange={(e) => setPrecio(e.target.value)}
                    />
                </div>

                <div className="form-campo">
                    <label className="form-label">Categoría</label>
                    <input
                        placeholder="Categoría"
                        value={Categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                    />
                </div>

                <div className="form-campo">
                    <label className="form-label">Imagen desde archivo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={manejarArchivo}
                    />
                    <small>Desde PC o celular podrás elegir una foto de la galería.</small>
                </div>

               
                {previewUrl && (
                    <div className="form-campo">
                        <label className="form-label">Vista previa</label>
                        <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px', borderRadius: '4px' }} />
                    </div>
                )}
            </div>

            <button className="btn btn-primary" type="submit" disabled={subiendo}>
                {subiendo ? 'Subiendo...' : 'Agregar producto'}
            </button>
        </form>
    )
}

export default CrearProducto 