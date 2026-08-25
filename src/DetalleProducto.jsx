import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './DetalleProducto.css'

function DetalleProducto() {

  const navigate = useNavigate()
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    traerCategorias()
    traerProducto()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  async function traerProducto() {
    const { data, error } = await supabase
      .from('Productos')
      .select('*')
      .eq('idProducto', id)

    if (error) {
      console.log(error)
      return
    }

    const p = data[0]

    const { data: categoria } = await supabase
      .from('categorias')
      .select('nombre')
      .eq('idcategoria', p.idCategoria)
      .single()

    const productoCompleto = {
      ...p,
      categoriaNombre: categoria?.nombre
    }

    setProducto(productoCompleto)
    setForm(productoCompleto)
    setPreviewUrl(productoCompleto.ImagenUrl || '')
  }

  const convertirArchivoABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Error convirtiendo el archivo a base64'))
      reader.readAsDataURL(file)
    })
  }

  const manejarArchivo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenFile(file)
    try {
      const base64 = await convertirArchivoABase64(file)
      setForm({ ...form, ImagenUrl: base64 })
      setPreviewUrl(base64)
    } catch (err) {
      console.error('Error procesando imagen:', err)
      alert('No se pudo procesar la imagen. Intentá con otro archivo.')
    }
  }

  async function guardarCambios() {
    const { error } = await supabase
      .from('Productos')
      .update({
        Nombre: form.Nombre,
        Descripcion: form.Descripcion,
        ImagenUrl: form.ImagenUrl,
        idCategoria: form.idCategoria,
      })
      .eq('idProducto', id)

    if (error) {
      alert('Error al guardar')
      console.error(error)
      return
    }

    alert('Guardado ✅')
    setEditando(false)
    // refrescar
    traerProducto()
  }

  async function eliminarProducto() {
    const confirmar = window.confirm(`¿Seguro que querés eliminar ${producto.Nombre}?`)
    if (!confirmar) return

    // verificamos si tiene ventas asociadas
    const { data: detalles } = await supabase
      .from('DetalleVentas')
      .select('idDetalle')
      .eq('idProducto', id)

    if (detalles && detalles.length > 0) {
      alert('No podés eliminar este producto porque tiene ventas registradas.')
      return
    }

    const { error } = await supabase
      .from('Productos')
      .delete()
      .eq('idProducto', id)

    if (error) {
      alert('Error al eliminar')
      return
    }

    alert('Producto eliminado ✅')
    navigate('/')
  }

  if (!producto) return <p>Cargando...</p>

  return (
    <div className="detalle-producto">


      <div className="detalle-producto-contenido">

        <div className="detalle-producto-imagen">
          {producto.ImagenUrl ? (
            <img
              src={producto.ImagenUrl}
              alt={producto.Nombre}
            />
          ) : (
            <p className="sin-imagen">Sin imagen</p>
          )}
        </div>


        <div className="detalle-producto-campos">

          <div className="campo-fila">
            <span className="campo-label">Nombre</span>

            {editando ? (
              <input
                className="campo-input"
                value={form.Nombre}
                onChange={(e) =>
                  setForm({ ...form, Nombre: e.target.value })
                }
              />
            ) : (
              <p className="campo-valor">
                {producto.Nombre}
              </p>
            )}

          </div>

          <div className="campo-fila">
            <span className="campo-label">Descripción</span>

            {editando ? (
              <textarea
                className="campo-input"
                value={form.Descripcion}
                onChange={(e) =>
                  setForm({ ...form, Descripcion: e.target.value })
                }
              />
            ) : (
              <p className="campo-valor descripcion-valor">
                {producto.Descripcion}
              </p>
            )}
          </div>
          <div className="campo-fila">
            <span className="campo-label">Categoría</span>
            {editando ? (
              <select
                className="campo-input"
                value={form.idCategoria}
                onChange={(e) =>
                  setForm({
                    ...form,
                    idCategoria: Number(e.target.value)
                  })
                }
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
            ) : (
              <p className="campo-valor">
                {producto.categoriaNombre || 'Sin categoría'}
              </p>
            )}

          </div>
          <div className="campo-fila">
            <span className="campo-label">En stock</span>

            {editando ? (
              <select
                className="campo-input"
                value={form.enStock ? "true" : "false"}
                onChange={(e) =>
                  setForm({
                    ...form, enStock: e.target.value === "true"
                  })
                }
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            ) : (
              <p className="campo-valor">
                {producto.enStock ? "Sí ✅" : "No ❌"}
              </p>
            )}


            {editando && (

              <div className="campo-fila">

                <span className="campo-label">
                  Cambiar imagen
                </span>


                <div className="imagen-editor">

                  <input
                    className="input-file"
                    type="file"
                    accept="image/*"
                    onChange={manejarArchivo}
                  />


                  <input
                    className="campo-input"
                    placeholder="O pegá una URL"
                    value={form.ImagenUrl || ''}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        ImagenUrl: e.target.value
                      })
                      setPreviewUrl(e.target.value)
                    }}
                  />


                  {previewUrl && (
                    <img
                      className="imagen-preview"
                      src={previewUrl}
                      alt="Vista previa"
                    />
                  )}

                </div>

              </div>

            )}

          </div>

        </div>


        <div className="detalle-producto-acciones">

          {editando ? (
            <>
              <button
                className="btn btn-primary"
                onClick={guardarCambios}
              >
                Guardar
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setEditando(true)}
              >
                Editar
              </button>

              <button
                className="btn btn-danger"
                onClick={eliminarProducto}
              >
                Eliminar
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  )
}


export default DetalleProducto