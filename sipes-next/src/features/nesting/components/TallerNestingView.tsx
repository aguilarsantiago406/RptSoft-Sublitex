"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import {
  actionActualizarEstado,
  actionAsignarParte,
  actionCrearSesion,
  actionListarSesiones,
  actionObtenerConsumo,
  actionRemoverParte,
  actionVincularArchivoTif,
  type ActionResult,
} from "../actions/nesting.actions";
import type { EstadoNesting, NestingSession } from "../services/nestingService";
import styles from "./nesting.module.css";

interface Aviso {
  tipo: "ok" | "error";
  texto: string;
}

const ETIQUETAS: Record<EstadoNesting, string> = {
  BORRADOR: "Borrador",
  EN_PROCESO: "En proceso",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

const BADGE: Record<EstadoNesting, string> = {
  BORRADOR: styles.badgeBorrador,
  EN_PROCESO: styles.badgeProceso,
  COMPLETADO: styles.badgeCompletado,
  CANCELADO: styles.badgeCancelado,
};

function useSeccion() {
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const ejecutar = useCallback(
    async <T,>(fn: () => Promise<ActionResult<T>>, mensajeOk: string): Promise<T | null> => {
      setCargando(true);
      setAviso(null);
      try {
        const res = await fn();
        if (res.ok) {
          setAviso({ tipo: "ok", texto: mensajeOk });
          return res.data;
        }
        setAviso({ tipo: "error", texto: res.error });
        return null;
      } catch {
        setAviso({ tipo: "error", texto: "No se pudo completar la operación." });
        return null;
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  return { cargando, aviso, ejecutar };
}

function AvisoInline({ aviso }: { aviso: Aviso | null }) {
  if (!aviso) return null;
  return (
    <p role={aviso.tipo === "error" ? "alert" : "status"} className={aviso.tipo === "ok" ? styles.avisoOk : styles.avisoError}>
      {aviso.texto}
    </p>
  );
}

function esTif(nombre: string): boolean {
  return /\.tiff?$/i.test(nombre);
}

export function TallerNestingView() {
  const [sesiones, setSesiones] = useState<NestingSession[]>([]);
  const [sesionId, setSesionId] = useState("");
  const [cargandoLista, setCargandoLista] = useState(true);
  const [avisoLista, setAvisoLista] = useState<Aviso | null>(null);

  const config = useSeccion();
  const estadoSec = useSeccion();
  const asignacion = useSeccion();
  const tif = useSeccion();
  const consumo = useSeccion();

  const [nombre, setNombre] = useState("");
  const [ancho, setAncho] = useState("");
  const [pedidoId, setPedidoId] = useState("");
  const [parteId, setParteId] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [consumoPedidoId, setConsumoPedidoId] = useState("");
  const [resultado, setResultado] = useState<any | null>(null);

  const sesion = sesiones.find((s) => s.id === sesionId) ?? null;
  const editable = sesion !== null && (sesion.estado === "BORRADOR" || sesion.estado === "EN_PROCESO");

  const recargar = useCallback(async (seleccionar?: string) => {
    setCargandoLista(true);
    setAvisoLista(null);
    try {
      const res = await actionListarSesiones();
      if (!res.ok) {
        setAvisoLista({ tipo: "error", texto: res.error });
        return;
      }
      setSesiones(res.data);
      setSesionId((actual) => {
        const objetivo = seleccionar ?? actual;
        return res.data.some((s) => s.id === objetivo) ? objetivo : "";
      });
    } catch {
      setAvisoLista({ tipo: "error", texto: "No se pudieron cargar las sesiones de nesting." });
    } finally {
      setCargandoLista(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  async function crearSesion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const anchoNum = Number(ancho);
    if (!nombre.trim() || !Number.isFinite(anchoNum) || anchoNum <= 0) {
      return;
    }
    const creada = await config.ejecutar(() => actionCrearSesion(nombre.trim(), anchoNum), "Sesión creada correctamente.");
    if (creada) {
      setNombre("");
      setAncho("");
      await recargar(creada.id);
    }
  }

  async function cambiarEstado(estado: EstadoNesting) {
    if (!sesion) return;
    const actualizada = await estadoSec.ejecutar(
      () => actionActualizarEstado(sesion.id, estado),
      `Sesión marcada como ${ETIQUETAS[estado].toLowerCase()}.`,
    );
    if (actualizada) await recargar(sesion.id);
  }

  async function asignarParte(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sesion || !pedidoId.trim() || !parteId.trim()) return;
    const ok = await asignacion.ejecutar(
      () => actionAsignarParte(sesion.id, pedidoId.trim(), parteId.trim()),
      "Parte asignada al rollo.",
    );
    if (ok) {
      setParteId("");
      await recargar(sesion.id);
    }
  }

  async function removerParte(id: string) {
    if (!sesion) return;
    await asignacion.ejecutar(() => actionRemoverParte(sesion.id, id), "Parte removida del rollo.");
    await recargar(sesion.id);
  }

  function elegirArchivo(file: File | null) {
    setErrorArchivo(null);
    if (file && !esTif(file.name)) {
      setArchivo(null);
      setErrorArchivo("Solo se permiten archivos .tif o .tiff.");
      setInputKey((k) => k + 1);
      return;
    }
    setArchivo(file);
  }

  async function vincularTif(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sesion || !archivo) return;
    const formData = new FormData();
    formData.append("archivo", archivo);
    const ok = await tif.ejecutar(() => actionVincularArchivoTif(sesion.id, formData), "Archivo TIF vinculado correctamente.");
    if (ok) {
      setArchivo(null);
      setInputKey((k) => k + 1);
      await recargar(sesion.id);
    }
  }

  async function consultarConsumo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consumoPedidoId.trim()) return;
    setResultado(null);
    const data = await consumo.ejecutar(() => actionObtenerConsumo(consumoPedidoId.trim()), "Consumo calculado.");
    if (data) setResultado(data);
  }

  return (
    <div className={styles.root}>
      <Card as="section" className={styles.toolbar}>
        <div className={styles.field}>
          <label htmlFor="sesion-select">Sesión de nesting</label>
          <select
            id="sesion-select"
            className={styles.input}
            value={sesionId}
            disabled={cargandoLista}
            onChange={(e) => setSesionId(e.target.value)}
          >
            <option value="">{cargandoLista ? "Cargando sesiones…" : "Selecciona una sesión"}</option>
            {sesiones.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} · {ETIQUETAS[s.estado]}
              </option>
            ))}
          </select>
        </div>

        {sesion && (
          <div className={styles.estadoBox}>
            <span className={`${styles.badge} ${BADGE[sesion.estado]}`}>{ETIQUETAS[sesion.estado]}</span>
            <div className={styles.acciones}>
              {sesion.estado === "BORRADOR" && (
                <Button size="sm" disabled={estadoSec.cargando} onClick={() => void cambiarEstado("EN_PROCESO")}>
                  Iniciar
                </Button>
              )}
              {sesion.estado === "EN_PROCESO" && (
                <Button size="sm" disabled={estadoSec.cargando} onClick={() => void cambiarEstado("COMPLETADO")}>
                  Completar
                </Button>
              )}
              {editable && (
                <Button size="sm" variant="danger" disabled={estadoSec.cargando} onClick={() => void cambiarEstado("CANCELADO")}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}
        <div className={styles.toolbarAvisos}>
          <AvisoInline aviso={avisoLista} />
          <AvisoInline aviso={estadoSec.aviso} />
        </div>
      </Card>

      <div className={styles.grid}>
        <Card as="section" className={styles.seccion}>
          <h2>1. Configurar sesión de nesting</h2>
          <form onSubmit={crearSesion} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="nesting-nombre">Nombre de la sesión</label>
              <input id="nesting-nombre" className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={120} />
            </div>
            <div className={styles.field}>
              <label htmlFor="nesting-ancho">Ancho de tela (metros)</label>
              <input id="nesting-ancho" className={styles.input} type="number" min="0.01" step="0.01" value={ancho} onChange={(e) => setAncho(e.target.value)} required />
            </div>
            <Button type="submit" disabled={config.cargando}>
              {config.cargando ? "Creando…" : "Crear sesión"}
            </Button>
          </form>
          <AvisoInline aviso={config.aviso} />
        </Card>

        <Card as="section" className={styles.seccion}>
          <h2>2. Asignación de pedidos</h2>
          {!editable && <p className={styles.ayuda}>Selecciona una sesión en borrador o en proceso.</p>}
          <form onSubmit={asignarParte} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="nesting-pedido">ID de pedido</label>
              <input id="nesting-pedido" className={styles.input} value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} disabled={!editable} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="nesting-parte">ID de parte</label>
              <input id="nesting-parte" className={styles.input} value={parteId} onChange={(e) => setParteId(e.target.value)} disabled={!editable} required />
            </div>
            <Button type="submit" disabled={!editable || asignacion.cargando}>
              {asignacion.cargando ? "Asignando…" : "Asignar al rollo"}
            </Button>
          </form>
          <AvisoInline aviso={asignacion.aviso} />
          {sesion && sesion.partes.length > 0 && (
            <ul className={styles.partes}>
              {sesion.partes.map((p) => (
                <li key={p.id}>
                  <span>
                    Pedido {p.pedidoId} · Parte {p.parteId}
                  </span>
                  {editable && (
                    <Button size="sm" variant="ghost" disabled={asignacion.cargando} onClick={() => void removerParte(p.id)}>
                      Quitar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card as="section" className={styles.seccion}>
          <h2>3. Vincular archivo TIF (R-K13)</h2>
          <p className={styles.ayuda}>Archivo de impresión .tif o .tiff de hasta 5 metros de largo.</p>
          {sesion?.archivoTifUrl && <p className={styles.ayuda}>Ya hay un archivo vinculado a esta sesión.</p>}
          <form onSubmit={vincularTif} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="nesting-tif">Archivo TIF</label>
              <input
                key={inputKey}
                id="nesting-tif"
                className={styles.input}
                type="file"
                accept=".tif,.tiff,image/tiff"
                disabled={!editable}
                onChange={(e) => elegirArchivo(e.target.files?.[0] ?? null)}
              />
            </div>
            {errorArchivo && <p role="alert" className={styles.avisoError}>{errorArchivo}</p>}
            <Button type="submit" disabled={!editable || !archivo || tif.cargando}>
              {tif.cargando ? "Subiendo…" : "Vincular archivo"}
            </Button>
          </form>
          <AvisoInline aviso={tif.aviso} />
        </Card>

        <Card as="section" className={styles.seccion}>
          <h2>4. Reporte de consumo y merma (R-K15)</h2>
          <form onSubmit={consultarConsumo} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="consumo-pedido">ID de pedido</label>
              <input id="consumo-pedido" className={styles.input} value={consumoPedidoId} onChange={(e) => setConsumoPedidoId(e.target.value)} required />
            </div>
            <Button type="submit" disabled={consumo.cargando}>
              {consumo.cargando ? "Calculando…" : "Consultar consumo"}
            </Button>
          </form>
          <AvisoInline aviso={consumo.aviso} />
          {resultado && (
            <dl className={styles.resultado}>
              <div>
                <dt>Consumo Tela / Real</dt>
                <dd>{(Number(resultado.metrosTela ?? resultado.consumoRealMetros) || 0).toFixed(2)} m</dd>
              </div>
              <div>
                <dt>Aprovechamiento / Merma</dt>
                <dd>{(Number(resultado.porcentajeAprovechamientoAncho ?? resultado.mermaPorcentaje) || 0).toFixed(2)} %</dd>
              </div>
              <div>
                <dt>Desperdicio / Merma linear</dt>
                <dd>{(Number(resultado.desperdicioLateralCm ?? resultado.metrosDesperdiciados) || 0).toFixed(2)} {resultado.desperdicioLateralCm !== undefined ? "cm" : "m"}</dd>
              </div>
            </dl>
          )}
        </Card>
      </div>
    </div>
  );
}