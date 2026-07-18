// ui/viewmodel/EquipoViewModel.kt
package com.planta.mantenimiento.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.planta.mantenimiento.data.repository.EquipoRepository
import com.planta.mantenimiento.model.Equipo
import kotlinx.coroutines.launch

class EquipoViewModel(private val repository: EquipoRepository) : ViewModel() {
    val equipos = repository.equipos

    fun crearEquipo(codigo: String, nombre: String, area: String) {
        viewModelScope.launch {
            repository.crearEquipo(
                Equipo(
                    codigo = codigo,
                    nombre = nombre,
                    area = area,
                    tipo = "bomba"
                )
            )
        }
    }

    fun sincronizar() {
        viewModelScope.launch {
            repository.sincronizarPendientes()
        }
    }
}