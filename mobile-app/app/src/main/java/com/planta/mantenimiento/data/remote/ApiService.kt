package com.planta.mantenimiento.data.remote

import com.planta.mantenimiento.model.Equipo
import retrofit2.http.*

interface ApiService {
    @GET("api/equipos")
    suspend fun listarEquipos(): List<Equipo>

    @POST("api/equipos")
    suspend fun crearEquipo(@Body equipo: Equipo): Map<String, String>
}