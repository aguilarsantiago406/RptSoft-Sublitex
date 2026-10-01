"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Image as ImageIcon,
  FileCode2,
  X,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import { actionSubirYCrearDiseno, actionActualizarArtefactos } from "../actions/disenos.actions";
import styles from "./modalSubirDiseno.module.css";

interface ModalSubirDisenoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoId: string;
  disenoId?: string;
  versionNumero?: number;
  initialAprobadoPorWhatsApp?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ModalSubirDiseno({
  isOpen,
  onClose,
  pedidoId,
  disenoId,
  versionNumero,
  initialAprobadoPorWhatsApp = false,
}: ModalSubirDisenoProps) {
  const isClient = useIsClient();
  const router = useRouter();

  const [mockupFile, setMockupFile] = useState<File | null>(null);
  const [mockupPreview, setMockupPreview] = useState<string | null>(null);
  const [vectorFile, setVectorFile] = useState<File | null>(null);
  const [aprobadoPorWhatsApp, setAprobadoPorWhatsApp] = useState(initialAprobadoPorWhatsApp);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mockupInputRef = useRef<HTMLInputElement>(null);
  const vectorInputRef = useRef<HTMLInputElement>(null);

  const isReemplazo = Boolean(disenoId);

  // Manejo de URL temporal de previsualización para evitar fugas de memoria
  useEffect(() => {
    if (!mockupFile) {
      setMockupPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(mockupFile);
    setMockupPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [mockupFile]);

  // Limpiar estado al cerrar o abrir
  useEffect(() => {
    if (!isOpen) {
      setMockupFile(null);
      setMockupPreview(null);
      setVectorFile(null);
      setError(null);
      setIsDragging(false);
    } else {
      setAprobadoPorWhatsApp(initialAprobadoPorWhatsApp);
    }
  }, [isOpen, initialAprobadoPorWhatsApp]);

  if (!isOpen || !isClient) return null;

  function validarYAsignarMockup(file: File) {
    const tiposPermitidos = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!tiposPermitidos.includes(file.type)) {
      setError("Solo se admiten imágenes en formato PNG, JPG o WebP.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("La imagen no debe superar los 25 MB.");
      return;
    }
    setError(null);
    setMockupFile(file);
  }

  // Eventos de Drag & Drop
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validarYAsignarMockup(files[0]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isReemplazo && !mockupFile) {
      setError("Debes seleccionar la imagen del mockup o captura de WhatsApp.");
      return;
    }
    if (isReemplazo && !mockupFile && !vectorFile) {
      setError("Debes seleccionar al menos un archivo para actualizar.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      if (mockupFile) formData.append("mockup", mockupFile);
      if (vectorFile) formData.append("vector", vectorFile);
      if (!isReemplazo && aprobadoPorWhatsApp) {
        formData.append("aprobadoPorWhatsApp", "true");
      }

      const res = isReemplazo
        ? await actionActualizarArtefactos(disenoId!, pedidoId, formData)
        : await actionSubirYCrearDiseno(pedidoId, formData);

      if (!res.ok) {
        setError(res.error || "Error al procesar el archivo.");
        return;
      }

      onClose();
      router.refresh();
    });
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>
                {isReemplazo
                  ? "Reemplazar Arte y Mockup"
                  : versionNumero && versionNumero > 1
                  ? `Subir Nueva Versión (v${versionNumero})`
                  : "Cargar Propuesta de Diseño"}
              </h3>
              <span className={styles.versionBadge}>
                {versionNumero ? `v${versionNumero}` : "Nueva Versión"}
              </span>
            </div>
            <p className={styles.subtitle}>
              {isReemplazo
                ? "Actualiza la imagen visual o el vector oficial de sublimación"
                : "Sube la imagen de la prenda para previsualización y aprobación del cliente"}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            {error && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Opción rápida: Aprobado por WhatsApp */}
            {!isReemplazo && (
              <div
                style={{
                  background: aprobadoPorWhatsApp ? "#f0fdf4" : "#f8fafc",
                  border: `1.5px solid ${aprobadoPorWhatsApp ? "#86efac" : "#e2e8f0"}`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  id="chk-whatsapp-approval"
                  checked={aprobadoPorWhatsApp}
                  onChange={(e) => setAprobadoPorWhatsApp(e.target.checked)}
                  style={{
                    marginTop: "3px",
                    width: "18px",
                    height: "18px",
                    accentColor: "#16a34a",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="chk-whatsapp-approval"
                  style={{ cursor: "pointer", fontSize: "0.86rem", color: "#1e293b", userSelect: "none" }}
                >
                  <strong style={{ display: "block", color: aprobadoPorWhatsApp ? "#15803d" : "#0f172a", fontSize: "0.9rem" }}>
                    Según modelo aprobado por WhatsApp (Aprobación directa)
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                    Marca el diseño como aprobado inmediatamente con esta captura o mockup y congela el bloque de diseño para taller, sin requerir el flujo largo de propuesta formal.
                  </span>
                </label>
              </div>
            )}

            {/* SECCIÓN 1: Mockup Principal */}
            <div>
              <div className={styles.sectionLabel}>
                <span>Mockup de la Prenda o Captura de WhatsApp</span>
                {!isReemplazo ? (
                  <span className={styles.requiredTag}>Requerido</span>
                ) : (
                  <span className={styles.optionalTag}>Opcional si solo cambias vector</span>
                )}
              </div>

              {/* Input oculto */}
              <input
                ref={mockupInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) validarYAsignarMockup(file);
                }}
              />

              {!mockupPreview ? (
                /* Zona Drag & Drop */
                <div
                  className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ""}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => mockupInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      mockupInputRef.current?.click();
                    }
                  }}
                >
                  <div className={styles.dropIconCircle}>
                    <UploadCloud size={28} />
                  </div>
                  <p className={styles.dropPrompt}>
                    Arrastra y suelta tu diseño aquí o{" "}
                    <span className={styles.dropPromptHighlight}>explora archivos</span>
                  </p>
                  <p className={styles.dropHelp}>
                    Formatos PNG, JPG, WebP (alta resolución recomendada, máx. 25 MB)
                  </p>
                </div>
              ) : (
                /* Miniatura en Vivo de la Prenda */
                <div className={styles.previewContainer}>
                  <div className={styles.previewImageFrame}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mockupPreview}
                      alt="Miniatura del mockup seleccionado"
                      className={styles.previewImg}
                    />
                  </div>

                  <div className={styles.previewMeta}>
                    <div className={styles.previewFileInfo}>
                      <span className={styles.previewFileName} title={mockupFile?.name}>
                        {mockupFile?.name}
                      </span>
                      <span className={styles.previewFileSize}>
                        {mockupFile ? formatBytes(mockupFile.size) : ""} · Listo para registrar
                      </span>
                    </div>

                    <div className={styles.previewActions}>
                      <button
                        type="button"
                        className={styles.btnChange}
                        onClick={() => mockupInputRef.current?.click()}
                        disabled={isPending}
                        title="Cambiar por otra imagen"
                      >
                        <RefreshCw size={13} />
                        Cambiar
                      </button>
                      <button
                        type="button"
                        className={styles.btnRemove}
                        onClick={() => {
                          setMockupFile(null);
                          if (mockupInputRef.current) mockupInputRef.current.value = "";
                        }}
                        disabled={isPending}
                        title="Quitar imagen"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: Archivo Vectorial (Taller) */}
            <div>
              <div className={styles.sectionLabel}>
                <span>Archivo Vectorial para Taller</span>
                <span className={styles.optionalTag}>Opcional (.CDR, .ZIP, .AI, .PDF)</span>
              </div>

              <input
                ref={vectorInputRef}
                type="file"
                accept=".cdr,.zip,.ai,.pdf,.tif"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setVectorFile(file);
                }}
              />

              <div className={styles.vectorBox}>
                <div className={styles.vectorInfo}>
                  <div className={styles.vectorIconCircle}>
                    {vectorFile ? <FileCheck size={20} color="#16a34a" /> : <FileCode2 size={20} />}
                  </div>
                  <div className={styles.vectorTexts}>
                    <span className={styles.vectorTitle}>
                      {vectorFile ? vectorFile.name : "Arte maestro para corte y sublimación"}
                    </span>
                    <span className={styles.vectorDesc}>
                      {vectorFile
                        ? `${formatBytes(vectorFile.size)} · Vector adjunto`
                        : "Archivos CorelDRAW (.cdr), comprimidos (.zip), Illustrator (.ai) o PDF"}
                    </span>
                  </div>
                </div>

                {vectorFile ? (
                  <button
                    type="button"
                    className={styles.btnVectorRemove}
                    onClick={() => {
                      setVectorFile(null);
                      if (vectorInputRef.current) vectorInputRef.current.value = "";
                    }}
                    disabled={isPending}
                    title="Quitar archivo vectorial"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.btnVectorSelect}
                    onClick={() => vectorInputRef.current?.click()}
                    disabled={isPending}
                  >
                    Adjuntar archivo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isPending || (!isReemplazo && !mockupFile)}
            >
              {isPending && <span className={styles.spinner} />}
              {isPending
                ? "Subiendo a Storage..."
                : isReemplazo
                ? "Guardar Cambios"
                : aprobadoPorWhatsApp
                ? "✓ Aprobar según WhatsApp"
                : "Subir y Registrar Propuesta"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
