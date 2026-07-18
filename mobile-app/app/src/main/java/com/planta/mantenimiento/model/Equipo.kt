package com.planta.mantenimiento.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "equipos")
data class Equipo(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val codigo: String,
    val nombre: String,
    val area: String,
    val tipo: String,
    val critico: Boolean = false,
    val estadoEquipo: String = "activo",
    val syncStatus: String = "PENDING"
)