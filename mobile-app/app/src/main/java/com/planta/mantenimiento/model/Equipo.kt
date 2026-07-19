package com.planta.mantenimiento.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "equipos")
data class Equipo(
    @PrimaryKey
    @SerializedName("id")
    val id: Int = 0,

    @SerializedName("codigo")
    val codigo: String = "",

    @SerializedName("nombre")
    val nombre: String = "",

    @SerializedName("area")
    val area: String = "",

    @SerializedName("tipo")
    val tipo: String = "",

    @SerializedName("fase")
    val fase: String = "",

    @SerializedName("critico")
    val critico: Boolean = false,

    @SerializedName("estado_equipo")
    val estadoEquipo: String = "activo",

    val syncStatus: String = "PENDING"
)