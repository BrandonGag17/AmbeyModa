import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { convertirArchivoABase64 } from './utils/imageUtils'
import { useIsAdmin } from './hooks/useIsAdmin'
import './CrearProducto.css'

function CrearProducto() {
  const navigate = useNavigate()
  const esAdmin = useIsAdmin()

  const [Nombre, setNombre] = useState('')
  const [Descripcion, setDescripcion] = useState('')
  const [ImagenUrl, setImagenUrl] = useState('')
  const [ImagenFile, setImagenFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState("")
  const [idCategoria, setIdCategoria] = useState("")

  const [fotosAdicionales, setFotosAdicionales] = useState([])
  const [previewsAdicionales, setPreviewsAdicionales] = useState([])

  useEffect(() => {
    traerCategorias()
  }, [])

  useEffect(() => {
    if (!ImagenFile) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(ImagenFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [ImagenFile])

  async function traerCategorias() {
    const { data, error } = await supabase
      .from('categorias')
      .select('idcategoria, nombre')
      .order('nombre', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setCategorias(data || [])
  }

  const manejarFotosAdicionales = (e) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    )

    setFotosAdicionales((fotosActuales) => [
      ...fotosActuales,
      ...files
    ])
    setPreviewsAdicionales((previewsActuales) => [
      ...previewsActuales,
      ...previews
    ])
    e.target.value = ''
  }

  const eliminarFotoAdicional = (index) => {
    URL.revokeObjectURL(previewsAdicionales[index])
    setFotosAdicionales((fotosActuales) =>
      fotosActuales.filter((_, fotoIndex) => fotoIndex !== index)
    )
    setPreviewsAdicionales((previewsActuales) =>
      previewsActuales.filter((_, fotoIndex) => fotoIndex !== index)
    )
  }

  async function crearCategoria() {
    if (!esAdmin) return
    if (!nuevaCategoria.trim()) {
      alert('Escribí un nombre para la categoría.')
      return
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert({
        nombre: nuevaCategoria.trim()
      })
      .select('idcategoria, nombre')
      .single()

    if (error) {
      alert('Error al crear la categoría.')
      console.error(error)
      return
    }

    await traerCategorias()

    if (data?.idcategoria) {
      setIdCategoria(data.idcategoria.toString())
    }
    setNuevaCategoria('')
    setMostrarNuevaCategoria(false)
  }

  async function agregarProducto(producto) {
    if (!esAdmin) return null
    try {
      const { data, error } = await supabase
        .from('Productos')
        .insert([producto])
        .select('idProducto')
        .single()

      if (error) {
        console.error('Error al crear producto:', error)
        alert(`Error al crear producto: ${error.message}`)
        return null
      }

      return data
    } catch (error) {
      console.error('Excepción al crear producto:', error)
      alert('Error inesperado al crear el producto.')
      return null
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    if (!esAdmin) {
      alert('Tu sesión no permite realizar esta acción.')
      return
    }

    if (!Nombre || !Descripcion || !idCategoria) {
      alert("Completa todos los campos antes de enviar.")
      return
    }

    if (!ImagenFile && !ImagenUrl) {
      alert("Sube una imagen principal.")
      return
    }

    setSubiendo(true)

    try {

      let imagenFinal = ImagenUrl

      if (ImagenFile) {
        imagenFinal = await convertirArchivoABase64(ImagenFile)
      }

      if (!imagenFinal) {
        alert("No se pudo procesar la imagen principal.")
        setSubiendo(false)
        return
      }

      const producto = {
        Nombre,
        Descripcion,
        idCategoria: Number(idCategoria),
        ImagenUrl: imagenFinal,
        enStock: true,
      }

      const creado = await agregarProducto(producto)

      if (!creado) {
        setSubiendo(false)
        return
      }

      for (let i = 0; i < fotosAdicionales.length; i++) {

        const imagen = await convertirArchivoABase64(
          fotosAdicionales[i]
        )

        const { error } = await supabase
          .from('FotosProducto')
          .insert({
            idProducto: creado.idProducto,
            ImagenUrl: imagen,
            orden: i + 1
          })

        if (error) {
          console.error('Error guardando foto adicional:', error)

          alert(
            'El producto se creó, pero hubo un problema guardando una de las fotos adicionales.'
          )

          setSubiendo(false)
          return
        }
      }

      alert('Producto creado ✅')

      navigate('/')

    } catch (error) {

      console.error('Error creando producto:', error)

      alert('Ocurrió un error al crear el producto.')

    } finally {

      setSubiendo(false)

    }
  }

  const manejarArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImagenFile(file)
    setImagenUrl('')
  }

  return (
    <div className="crear-producto-page">

      <form className="crear-producto-card" onSubmit={manejarSubmit}>

        <h1>Nuevo producto</h1>
        <p>Completá la información de la prenda</p>

        <div className="form-campo">
          <label>Nombre</label>
          <input
            placeholder="Ej. Remera Oversize"
            value={Nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-campo">
          <label>Descripción</label>
          <textarea
            rows="4"
            placeholder="Descripción del producto..."
            value={Descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>


        <div className="form-campo">
          <label>Categoría</label>

          <select
            className="campo-input"
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
          >
            <option value="">Seleccionar categoría</option>

            {categorias.map((categoria) => (
              <option
                key={categoria.idcategoria}
                value={categoria.idcategoria}
              >
                {categoria.nombre}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setMostrarNuevaCategoria(true)}
          >
            + Nueva categoría
          </button>
          {mostrarNuevaCategoria && (
            <div className="form-campo">

              <label>Nueva categoría</label>

              <input
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                placeholder="Ej. Camperas"
              />

              <button
                type="button"
                className="btn btn-primary"
                onClick={crearCategoria}
              >
                Crear categoría
              </button>

            </div>
          )}
        </div>

        <div className="form-campo">
          <label>Imagen</label>

          <input
            type="file"
            accept="image/*"
            onChange={manejarArchivo}
          />

          <small>
            Elegí una imagen desde tu dispositivo.
          </small>
        </div>

        {previewUrl && (
          <div className="preview-imagen">
            <img
              src={previewUrl}
              alt="Vista previa"
            />
          </div>
        )}


        <div className="form-campo">
          <label>¡Agregá más fotos a la descripción!</label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={manejarFotosAdicionales}
          />

          <small>
            Podés seleccionar varias fotos.
          </small>
        </div>
        {previewsAdicionales.length > 0 && (
          <div className="previews-adicionales">
            {previewsAdicionales.map((preview, index) => (
              <div className="preview-adicional-contenedor" key={preview}>
                <img
                  src={preview}
                  alt={`Vista previa ${index + 1}`}
                  className="preview-adicional"
                />
                <button
                  type="button"
                  className="eliminar-preview-btn"
                  onClick={() => eliminarFotoAdicional(index)}
                  aria-label={`Eliminar foto adicional ${index + 1}`}
                  title="Eliminar foto"
                >
                  X 
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          className="guardar-btn"
          type="submit"
          disabled={subiendo}
        >
          {subiendo ? "Subiendo..." : "Agregar producto"}
        </button>
      </form>

    </div>
  )
}

export default CrearProducto 