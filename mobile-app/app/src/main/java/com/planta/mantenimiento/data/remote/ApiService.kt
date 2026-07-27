package com.planta.mantenimiento.data.remote

import com.planta.mantenimiento.model.Equipo
import com.planta.mantenimiento.model.Mantenimiento
import retrofit2.http.*

interface ApiService {
    // Equipos
    @GET("api/equipos")
    suspend fun listarEquipos(): List<Equipo>

    @POST("api/equipos")
    suspend fun crearEquipo(@Body equipo: Equipo): Map<String, String>

    // Mantenimiento
    @POST("api/mantenimiento")
    suspend fun crearMantenimiento(@Body mantenimiento: Mantenimiento): Mantenimiento

    @GET("api/equipos/{id}/mantenimiento")
    suspend fun listarMantenimientoPorEquipo(@Path("id") equipoId: Int): List<Mantenimiento>
}