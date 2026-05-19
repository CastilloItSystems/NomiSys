/**
 * Stub interfaces for legacy modules (AutoSys, workshop, etc.)
 * These types are kept for backward compatibility.
 */

export interface Recepcion {
  id: string;
  [key: string]: unknown;
}

export interface Refineria {
  id: string;
  [key: string]: unknown;
}

export interface Notification {
  id?: string;
  _id?: string;
  userId?: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: { nombre?: string; name?: string; [key: string]: unknown };
}

export interface TipoProducto {
  id: string;
  nombre: string;
  rendimientos: unknown[];
  [key: string]: unknown;
}
