const API = "/api/mantenimiento";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.mensaje ||
      data?.message ||
      "Error en la solicitud"
    );
  }

  return data;
}

export function obtenerMantenimiento(id: number) {
  return request<any>(`${API}/${id}`);
}

export function obtenerMantenimientoCompleto(id: number) {
  return request<any>(`${API}/${id}/completo`);
}

export function listarMantenimientosEquipo(equipoId: number) {
  return request<any[]>(
    `/api/equipos/${equipoId}/mantenimiento`
  );
}

export function crearMantenimiento(data: any) {
  return request<any>(API, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function actualizarMantenimiento(
  id: number,
  data: any
) {
  return request<any>(`${API}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function crearActividad(
  mantenimientoId: number,
  data: any
) {
  return request<any>(
    `${API}/${mantenimientoId}/actividades`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function actualizarActividad(
  id: number,
  data: any
) {
  return request<any>(
    `${API}/actividades/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function crearAvance(
  mantenimientoId: number,
  data: any
) {
  return request<any>(
    `${API}/${mantenimientoId}/avances`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function actualizarAvance(
  id: number,
  data: any
) {
  return request<any>(
    `${API}/avances/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function crearPersonal(
  mantenimientoId: number,
  data: any
) {
  return request<any>(
    `${API}/${mantenimientoId}/personal`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function actualizarPersonal(
  id: number,
  data: any
) {
  return request<any>(
    `${API}/personal/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}
export function crearProgramacion(
  mantenimientoId: number,
  data: any
) {
  return request<any>(
    `${API}/${mantenimientoId}/programacion`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function actualizarProgramacion(
  id: number,
  data: any
) {
  return request<any>(
    `${API}/programacion/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function crearEjecucion(
  mantenimientoId: number,
  data: any
) {
  return request<any>(
    `${API}/${mantenimientoId}/ejecucion`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function actualizarEjecucion(
  id: number,
  data: any
) {
  return request<any>(
    `${API}/ejecucion/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function crearMaterial(
  mantenimientoId: number,
  data: any
) {
  return request<any>(
    `${API}/${mantenimientoId}/materiales`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function actualizarMaterial(
  id: number,
  data: any
) {
  return request<any>(
    `${API}/materiales/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function crearParada(
  mantenimientoId: number,
  data: any
) {
  return request<any>(
    `${API}/${mantenimientoId}/paradas`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function actualizarParada(
  id: number,
  data: any
) {
  return request<any>(
    `${API}/paradas/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function listarHistorial(
  mantenimientoId: number
) {
  return request<any[]>(
    `${API}/${mantenimientoId}/historial`
  );
}
export function listarActividades(
  mantenimientoId: number
) {
  return request<any[]>(
    `${API}/${mantenimientoId}/actividades`
  );
}

export function listarAvances(
  mantenimientoId: number
) {
  return request<any[]>(
    `${API}/${mantenimientoId}/avances`
  );
}

export function listarPersonal(
  mantenimientoId: number
) {
  return request<any[]>(
    `${API}/${mantenimientoId}/personal`
  );
}

export function listarProgramacion(
  mantenimientoId: number
) {
  return request<any[]>(
    `${API}/${mantenimientoId}/programacion`
  );
}

export function listarEjecuciones(
  mantenimientoId: number
) {
  return request<any[]>(
    `${API}/${mantenimientoId}/ejecucion`
  );
}

export function listarMateriales(
  mantenimientoId: number
) {
  return request<any[]>(
    `${API}/${mantenimientoId}/materiales`
  );
}

export function listarParadas(
  mantenimientoId: number
) {
  return request<any[]>(
    `${API}/${mantenimientoId}/paradas`
  );
}
export async function eliminarActividad(id: number) {
  return request<void>(`${API}/actividades/${id}`, {
    method: "DELETE",
  });
}

export async function eliminarAvance(id: number) {
  return request<void>(`${API}/avances/${id}`, {
    method: "DELETE",
  });
}

export async function eliminarPersonal(id: number) {
  return request<void>(`${API}/personal/${id}`, {
    method: "DELETE",
  });
}

export async function eliminarProgramacion(id: number) {
  return request<void>(`${API}/programacion/${id}`, {
    method: "DELETE",
  });
}

export async function eliminarEjecucion(id: number) {
  return request<void>(`${API}/ejecucion/${id}`, {
    method: "DELETE",
  });
}

export async function eliminarMaterial(id: number) {
  return request<void>(`${API}/materiales/${id}`, {
    method: "DELETE",
  });
}

export async function eliminarParada(id: number) {
  return request<void>(`${API}/paradas/${id}`, {
    method: "DELETE",
  });
}