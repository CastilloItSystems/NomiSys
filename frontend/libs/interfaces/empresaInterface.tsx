import { Usuario } from "./authInterface";

export interface Empresa {
  id: string;
  name: string;
  address?: string | null;
  phones?: string | null;
  fax?: string | null;
  numerorif?: string | null;
  numeronit?: string | null;
  website?: string | null;
  email?: string | null;
  contact?: string | null;
  isDefault: boolean;
  soporte1?: string | null;
  soporte2?: string | null;
  soporte3?: string | null;
  data_usaweb: boolean;
  data_servidor?: string | null;
  data_usuario?: string | null;
  data_password?: string | null;
  data_port?: string | null;
  licencia?: string | null;
  historizada: boolean;
  masinfo?: string | null;
  usa_prefijo: boolean;
  name_prefijo?: string | null;
  dprefijobd?: string | null;
  dprefijosrv?: string | null;
  dprefijousr?: string | null;
  logoUrl?: string | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  users?: Usuario[];
}

export interface EmpresaCreate {
  name: string;
  address?: string;
  phones?: string;
  fax?: string;
  numerorif?: string;
  numeronit?: string;
  website?: string;
  email?: string;
  contact?: string;
  isDefault?: boolean;
  soporte1?: string;
  soporte2?: string;
  soporte3?: string;
  data_usaweb?: boolean;
  data_servidor?: string;
  data_usuario?: string;
  data_password?: string;
  data_port?: string;
  licencia?: string;
  historizada?: boolean;
  masinfo?: string;
  usa_prefijo?: boolean;
  name_prefijo?: string;
  dprefijobd?: string;
  dprefijosrv?: string;
  dprefijousr?: string;
  logoUrl?: string;
}

export interface EmpresaUpdate extends Partial<EmpresaCreate> {}
