"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import {
  actionAsignarParte,
  actionCrearSesion,
  actionListarPedidosProduccion,
  actionListarSesiones,
  actionObtenerConsumo,
  actionObtenerSesion,
  actionObtenerTelasCatalogo,
  actionVincularArchivoTif,
  type ActionResult,
  type PedidoProduccionItem,
} from "../actions/nesting.actions";
import type { ConsumoResponse, NestingSession } from "../services/nestingService";
import type { ValorAtributoCatalogo } from "@/features/catalogos/types/catalogo";
import styles from "./nesting.module.css";

interface Aviso {
  tipo: "ok" | "error";
  texto: string;
}

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
  const [telas, setTelas] = useState<ValorAtributoCatalogo[]>([]);
  const [pedidosProduccion, setPedidosProduccion] = useState<PedidoProduccionItem[]>([]);
  const [sesionId, setSesionId] = useState("");
  const [sesionDetalle, setSesionDetalle] = useState<NestingSession | null>(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [avisoLista, setAvisoLista] = useState<Aviso | null>(null);

  const config = useSeccion();
  const asignacion = useSeccion();
  const tif = useSeccion();
  const consumo = useSeccion();

  const [codigoSesion, setCodigoSesion] = useState("");
  const [telaId, setTelaId] = useState("");

  const [pedidoId, setPedidoId] = useState("");
  const [modoManualPedido, setModoManualPedido] = useState(false);
  const [anchoCm, setAnchoCm] = useState("");
  const [largoCm, setLargoCm] = useState("");
  const [esRib, setEsRib] = useState(false);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

  const [consumoPedidoId, setConsumoPedidoId] = useState("");
  const [resultadoConsumo, setResultadoConsumo] = useState<ConsumoResponse | null>(null);

  const recargarDetalle = useCallback(async (id: string) => {
    if (!id) {
      setSesionDetalle(null);
      return;
    }
    const res = await actionObtenerSesion(id);
    if (res.ok) {
      setSesionDetalle(res.data);
    }
  }, []);

  const recargar = useCallback(async (seleccionar?: string) => {
    setCargandoLista(true);
    setAvisoLista(null);
    try {
      const [resSesiones, resTelas, resPedidos] = await Promise.all([
        actionListarSesiones(),
        actionObtenerTelasCatalogo(),
        actionListarPedidosProduccion(),
      ]);

      if (resTelas.ok) {
        setTelas(resTelas.data);
      }

      if (resPedidos.ok) {
        setPedidosProduccion(resPedidos.data);
      }

      if (!resSesiones.ok) {
        setAvisoLista({ tipo: "error", texto: resSesiones.error });
        return;
      }

      setSesiones(resSesiones.data);
      const siguienteId = seleccionar ?? (resSesiones.data.some((s) => s.id === sesionId) ? sesionId : resSesiones.data[0]?.id ?? "");
      setSesionId(siguienteId);
      if (siguienteId) {
        void recargarDetalle(siguienteId);
      } else {
        setSesionDetalle(null);
      }
    } catch {
      setAvisoLista({ tipo: "error", texto: "No se pudieron cargar las sesiones de nesting." });
    } finally {
      setCargandoLista(false);
    }
  }, [sesionId, recargarDetalle]);

  useEffect(() => {
    void recargar();
  }, []);

  useEffect(() => {
    if (sesionId) {
      void recargarDetalle(sesionId);
    } else {
      setSesionDetalle(null);
    }
  }, [sesionId, recargarDetalle]);

  async function crearSesion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!codigoSesion.trim() || !telaId) return;

    const creada = await config.ejecutar(
      () => actionCrearSesion(codigoSesion.trim().toUpperCase(), telaId),
      "Sesión de corte y rollo creada correctamente.",
    );
    if (creada) {
      setCodigoSesion("");
      setTelaId("");
      await recargar(creada.id);
    }
  }

  async function asignarParte(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sesionId || !pedidoId.trim()) return;
    const anchoNum = Number(anchoCm);
    const largoNum = Number(largoCm);
    if (anchoNum <= 0 || anchoNum > 180 || largoNum <= 0) return;

    const ok = await asignacion.ejecutar(
      () => actionAsignarParte(sesionId, pedidoId.trim(), anchoNum, largoNum, esRib),
      "Parte asignada al rollo correctamente.",
    );
    if (ok) {
      setAnchoCm("");
      setLargoCm("");
      setEsRib(false);
      await recargarDetalle(sesionId);
    }
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
    if (!sesionId || !archivo) return;
    const formData = new FormData();
    formData.append("archivo", archivo);
    const ok = await tif.ejecutar(
      () => actionVincularArchivoTif(sesionId, formData),
      "Archivo de impresión TIF vinculado y registrado en el rollo.",
    );
    if (ok) {
      setArchivo(null);
      setInputKey((k) => k + 1);
      await recargarDetalle(sesionId);
    }
  }

  async function consultarConsumo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consumoPedidoId.trim()) return;
    setResultadoConsumo(null);
    const data = await consumo.ejecutar(
      () => actionObtenerConsumo(consumoPedidoId.trim()),
      "Consumo de tela calculado correctamente.",
    );
    if (data) setResultadoConsumo(data);
  }

  const anchoNumerico = Number(anchoCm);
  const anchoValido = Number.isFinite(anchoNumerico) && anchoNumerico > 0 && anchoNumerico <= 180;
  const porcentajeOcupado = anchoValido ? ((anchoNumerico / 180) * 100).toFixed(1) : "0";
  const desperdicioEstimado = anchoValido ? 180 - anchoNumerico : 0;

  return (
    <div className={styles.root}>
      <Card as="section" className={styles.toolbar}>
        <div className={styles.field}>
          <label htmlFor="sesion-select">Sesión de rollo de tela activa</label>
          <select
            id="sesion-select"
            className={styles.input}
            value={sesionId}
            disabled={cargandoLista}
            onChange={(e) => setSesionId(e.target.value)}
          >
            <option value="">{cargandoLista ? "Cargando sesiones…" : "Selecciona una sesión de tela"}</option>
            {sesiones.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigo} · {s.tela?.etiqueta ?? "Tela base"}
              </option>
            ))}
          </select>
        </div>

        {sesionDetalle && (
          <div className={styles.estadoBox}>
            <span className={`${styles.badge} ${styles.badgeProceso}`}>
              {sesionDetalle.codigo} · {sesionDetalle.tela?.etiqueta ?? "Tela"} (Ancho estándar {sesionDetalle.anchoImpresionM ?? 1.8} m)
            </span>
          </div>
        )}
        <div className={styles.toolbarAvisos}>
          <AvisoInline aviso={avisoLista} />
        </div>
      </Card>

      <div className={styles.grid}>
        <Card as="section" className={styles.seccion}>
          <h2>1. Configuración de rollo de tela</h2>
          <form onSubmit={crearSesion} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="nesting-codigo">Código del rollo / sesión</label>
              <input
                id="nesting-codigo"
                className={styles.input}
                placeholder="Ej. NES-2026-001"
                value={codigoSesion}
                onChange={(e) => setCodigoSesion(e.target.value)}
                required
                maxLength={60}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="nesting-tela">Tipo de tela</label>
              <select
                id="nesting-tela"
                className={styles.input}
                value={telaId}
                onChange={(e) => setTelaId(e.target.value)}
                required
              >
                <option value="">Selecciona la tela del rollo</option>
                {telas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.etiqueta} {t.codigo ? `(${t.codigo})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <p className={styles.ayuda}>Ancho industrial estándar de impresión: 1.80 metros.</p>
            <Button type="submit" disabled={config.cargando}>
              {config.cargando ? "Creando…" : "Crear sesión de rollo"}
            </Button>
          </form>
          <AvisoInline aviso={config.aviso} />
        </Card>

        <Card as="section" className={styles.seccion}>
          <h2>2. Asignación de partes por pedido</h2>
          {!sesionDetalle && <p className={styles.ayuda}>Selecciona una sesión de rollo para registrar partes.</p>}
          <form onSubmit={asignarParte} className={styles.form}>
            <div className={styles.field}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="nesting-pedido">Pedido asignado</label>
                <button
                  type="button"
                  className={styles.selectorToggle}
                  onClick={() => setModoManualPedido(!modoManualPedido)}
                >
                  {modoManualPedido ? "Elegir de lista de pedidos" : "Ingresar ID manual"}
                </button>
              </div>

              {!modoManualPedido && pedidosProduccion.length > 0 ? (
                <select
                  id="nesting-pedido"
                  className={styles.input}
                  value={pedidoId}
                  disabled={!sesionDetalle}
                  onChange={(e) => {
                    setPedidoId(e.target.value);
                    if (e.target.value) setConsumoPedidoId(e.target.value);
                  }}
                  required
                >
                  <option value="">Selecciona un pedido para corte</option>
                  {pedidosProduccion.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.codigo}] {p.clienteNombre} · {p.totalPrendas} prendas {p.bloquesListos ? "(Listo para corte)" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="nesting-pedido"
                  className={styles.input}
                  placeholder="ID o código del pedido"
                  value={pedidoId}
                  onChange={(e) => {
                    setPedidoId(e.target.value);
                    if (e.target.value) setConsumoPedidoId(e.target.value);
                  }}
                  disabled={!sesionDetalle}
                  required
                />
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="nesting-ancho">Ancho ocupado en centímetros (máximo 180 cm)</label>
              <input
                id="nesting-ancho"
                className={styles.input}
                type="number"
                min="1"
                max="180"
                placeholder="Ej. 175"
                value={anchoCm}
                onChange={(e) => setAnchoCm(e.target.value)}
                disabled={!sesionDetalle}
                required
              />
            </div>

            {anchoValido && (
              <div className={styles.medidorContainer}>
                <div className={styles.medidorLeyenda}>
                  <span>Ancho ocupado: {anchoNumerico} cm ({porcentajeOcupado}%)</span>
                  <span>Margen lateral: {desperdicioEstimado} cm</span>
                </div>
                <div className={styles.medidorBarra}>
                  <div className={styles.medidorOcupado} style={{ width: `${porcentajeOcupado}%` }} />
                  <div className={styles.medidorDesperdicio} style={{ width: `${100 - Number(porcentajeOcupado)}%` }} />
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="nesting-largo">Largo ocupado en centímetros</label>
              <input
                id="nesting-largo"
                className={styles.input}
                type="number"
                min="1"
                placeholder="Ej. 350"
                value={largoCm}
                onChange={(e) => setLargoCm(e.target.value)}
                disabled={!sesionDetalle}
                required
              />
            </div>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={esRib}
                onChange={(e) => setEsRib(e.target.checked)}
                disabled={!sesionDetalle}
              />
              <span>Es corte de Rib / Cuello tejido (se computa independiente de la tela base)</span>
            </label>

            <Button type="submit" disabled={!sesionDetalle || asignacion.cargando}>
              {asignacion.cargando ? "Asignando…" : "Asignar parte al rollo"}
            </Button>
          </form>
          <AvisoInline aviso={asignacion.aviso} />

          {sesionDetalle?.partes && sesionDetalle.partes.length > 0 && (
            <ul className={styles.partes}>
              {sesionDetalle.partes.map((p) => (
                <li key={p.id}>
                  <span>
                    Parte #{p.numeroParte ?? 1}: Pedido {p.pedidoId} · {p.anchoCm}×{p.largoCm} cm {p.esRib ? "(Rib)" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card as="section" className={styles.seccion}>
          <h2>3. Archivos de impresión TIF (Particionado)</h2>
          <p className={styles.ayuda}>
            Formato técnico: SUBLITEX_PEDIDO_TELA_ANCHO_LARGO_ORDENdeTOTAL.tif (máximo 5 metros continuos por pieza).
          </p>
          <form onSubmit={vincularTif} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="nesting-tif">Archivo TIF exportado</label>
              <input
                key={inputKey}
                id="nesting-tif"
                className={styles.input}
                type="file"
                accept=".tif,.tiff,image/tiff"
                disabled={!sesionDetalle}
                onChange={(e) => elegirArchivo(e.target.files?.[0] ?? null)}
              />
            </div>
            {errorArchivo && <p role="alert" className={styles.avisoError}>{errorArchivo}</p>}
            <Button type="submit" disabled={!sesionDetalle || !archivo || tif.cargando}>
              {tif.cargando ? "Subiendo y vinculando…" : "Vincular archivo TIF"}
            </Button>
          </form>
          <AvisoInline aviso={tif.aviso} />

          {sesionDetalle?.archivos && sesionDetalle.archivos.length > 0 && (
            <ul className={styles.archivosList}>
              {sesionDetalle.archivos.map((a) => (
                <li key={a.id}>
                  <span>
                    <strong>Pieza {a.ordenEnSerie} de {a.totalSerie}:</strong> {a.nombre} · {a.largoM} m
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card as="section" className={styles.seccion}>
          <h2>4. Reporte de consumo y rendimiento textil</h2>
          <form onSubmit={consultarConsumo} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="consumo-pedido">Pedido a consultar</label>
              {pedidosProduccion.length > 0 ? (
                <select
                  id="consumo-pedido"
                  className={styles.input}
                  value={consumoPedidoId}
                  onChange={(e) => setConsumoPedidoId(e.target.value)}
                  required
                >
                  <option value="">Selecciona el pedido</option>
                  {pedidosProduccion.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.codigo}] {p.clienteNombre}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="consumo-pedido"
                  className={styles.input}
                  placeholder="ID o código del pedido"
                  value={consumoPedidoId}
                  onChange={(e) => setConsumoPedidoId(e.target.value)}
                  required
                />
              )}
            </div>
            <Button type="submit" disabled={consumo.cargando}>
              {consumo.cargando ? "Calculando…" : "Consultar rendimiento"}
            </Button>
          </form>
          <AvisoInline aviso={consumo.aviso} />

          {resultadoConsumo && (
            <>
              <dl className={styles.resultado}>
                <div>
                  <dt>Metros Tela Principal</dt>
                  <dd>{(Number(resultadoConsumo.metrosTela) || 0).toFixed(2)} m</dd>
                </div>
                <div>
                  <dt>Metros Rib / Cuello</dt>
                  <dd>{(Number(resultadoConsumo.metrosRib) || 0).toFixed(2)} m</dd>
                </div>
                <div>
                  <dt>Metros Lineales Totales</dt>
                  <dd>{(Number(resultadoConsumo.metrosLineales) || 0).toFixed(2)} m</dd>
                </div>
                <div>
                  <dt>Aprovechamiento de Ancho</dt>
                  <dd>{resultadoConsumo.porcentajeAprovechamientoAncho !== null && resultadoConsumo.porcentajeAprovechamientoAncho !== undefined ? `${resultadoConsumo.porcentajeAprovechamientoAncho}%` : "-"}</dd>
                </div>
                <div>
                  <dt>Desperdicio Lateral</dt>
                  <dd>{resultadoConsumo.desperdicioLateralCm !== null && resultadoConsumo.desperdicioLateralCm !== undefined ? `${resultadoConsumo.desperdicioLateralCm} cm` : "-"}</dd>
                </div>
                <div>
                  <dt>Costo de Impresión</dt>
                  <dd>{resultadoConsumo.costoImpresion !== null && resultadoConsumo.costoImpresion !== undefined ? `S/ ${resultadoConsumo.costoImpresion.toFixed(2)}` : "Sin tarifa vigente"}</dd>
                </div>
              </dl>
              {resultadoConsumo.desglosePorTela && resultadoConsumo.desglosePorTela.length > 0 && (
                <div className={styles.desgloseList}>
                  <strong>Desglose por tela:</strong>
                  {resultadoConsumo.desglosePorTela.map((d) => (
                    <span key={d.telaId}>
                      {d.telaNombre}: {d.metrosLineales} m
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}