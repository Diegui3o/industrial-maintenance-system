package com.planta.mantenimiento.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "mantenimiento")
data class Mantenimiento(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val equipoId: Int,
    val fechaReporte: String,          // ISO 8601
    val fase: String,
    val taller: String,
    val tipoCriticidad: String = "",
    val sistema: String = "",
    val inicioParada: String? = null,
    val finParada: String? = null,
    val horas: Double = 0.0,
    val tipoIntervencion: String,
    val modoFalla: String = "",
    val consecuenciaInmediata: String = "",
    val descripcionEvento: String = "",
    val standBy: Boolean = false,
    val produccionAfectada: Boolean = false,
    val tnDejadasProcesar: Double = 0.0,
    val enlace: String = "",
    val estadoFalla: String = "abierta",
    val syncStatus: String = "PENDING" // PENDING, SYNCED
)